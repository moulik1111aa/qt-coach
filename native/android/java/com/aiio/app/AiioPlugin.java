package com.aiio.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.view.WindowManager;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;
import java.util.Map;

/**
 * Aiio's bridge to the phone (adapted from MN's plugin): the back button, a native mirror of
 * the save (progress survives if the WebView's storage is cleared), reading worked steps aloud
 * with the phone's English voice, and keep-screen-on. The web side is src/platform/native.ts.
 */
@CapacitorPlugin(name = "Aiio")
public class AiioPlugin extends Plugin {

    private static final String PREFS = "aiio_save";
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private String pendingText = null;

    @Override
    public void load() {
        Context ctx = getContext();
        tts = new TextToSpeech(ctx.getApplicationContext(), status -> {
            if (status != TextToSpeech.SUCCESS || tts == null) return;
            // Indian English first, then British, then US.
            Locale[] wanted = { new Locale("en", "IN"), Locale.UK, Locale.US, Locale.ENGLISH };
            for (Locale l : wanted) {
                int r = tts.setLanguage(l);
                if (r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED) {
                    ttsReady = true;
                    break;
                }
            }
            Voice best = bestVoice();
            if (best != null) tts.setVoice(best);
            if (ttsReady && pendingText != null) {
                speakNow(pendingText, 1.0f);
                pendingText = null;
            }
        });

        AppCompatActivity activity = getActivity();
        activity.runOnUiThread(() ->
            activity
                .getOnBackPressedDispatcher()
                .addCallback(
                    activity,
                    new OnBackPressedCallback(true) {
                        @Override
                        public void handleOnBackPressed() {
                            // The app decides (close a sheet or keypad, go back a screen, or leave).
                            if (hasListeners("back")) notifyListeners("back", new JSObject());
                            else activity.moveTaskToBack(true);
                        }
                    }
                )
        );
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }
        super.handleOnDestroy();
    }

    @Override
    protected void handleOnPause() {
        if (tts != null) tts.stop();
        super.handleOnPause();
    }

    @PluginMethod
    public void keepAwake(PluginCall call) {
        boolean on = Boolean.TRUE.equals(call.getBoolean("on", false));
        getActivity().runOnUiThread(() -> {
            if (on) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        });
        call.resolve();
    }

    @PluginMethod
    public void exit(PluginCall call) {
        call.resolve();
        getActivity().runOnUiThread(() -> getActivity().moveTaskToBack(true));
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    @PluginMethod
    public void readSave(PluginCall call) {
        JSObject values = new JSObject();
        for (Map.Entry<String, ?> entry : prefs().getAll().entrySet()) {
            if (entry.getValue() instanceof String) values.put(entry.getKey(), (String) entry.getValue());
        }
        JSObject result = new JSObject();
        result.put("values", values);
        call.resolve(result);
    }

    @PluginMethod
    public void writeSave(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        if (key == null || value == null) {
            call.reject("key and value are required");
            return;
        }
        prefs().edit().putString(key, value).apply();
        call.resolve();
    }

    /** Clear, natural voices first: Indian English, high quality, works offline. */
    private static int score(Voice v) {
        int s = v.getQuality() / 10;
        String c = v.getLocale().getCountry();
        if ("IN".equals(c)) s += 30;
        else if ("GB".equals(c)) s += 20;
        else if ("US".equals(c)) s += 15;
        if (v.isNetworkConnectionRequired()) s -= 12;
        return s;
    }

    private Voice bestVoice() {
        Voice best = null;
        try {
            java.util.Set<Voice> all = tts.getVoices();
            if (all == null) return null;
            for (Voice v : all) {
                if (v.getLocale() == null || !"en".equals(v.getLocale().getLanguage())) continue;
                if (v.getFeatures() != null && v.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                if (best == null || score(v) > score(best)) best = v;
            }
        } catch (Exception ignored) {
            // Some engines throw before they are ready.
        }
        return best;
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        Double rate = call.getDouble("rate", 1.0);
        if (tts == null || text == null || text.isEmpty()) {
            call.resolve();
            return;
        }
        if (!ttsReady) {
            pendingText = text;
            call.resolve();
            return;
        }
        speakNow(text, rate == null ? 1.0f : rate.floatValue());
        call.resolve();
    }

    private void speakNow(String text, float rate) {
        tts.setSpeechRate(rate);
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "step");
    }

    @PluginMethod
    public void stopSpeaking(PluginCall call) {
        pendingText = null;
        if (tts != null) tts.stop();
        call.resolve();
    }
}
