package com.aiio.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    @SuppressWarnings("deprecation")
    public void onCreate(Bundle savedInstanceState) {
        // The app's own plugin must be registered before the bridge starts.
        registerPlugin(AiioPlugin.class);
        super.onCreate(savedInstanceState);
        try {
            WebView web = getBridge() != null ? getBridge().getWebView() : null;
            if (web != null) {
                WebSettings s = web.getSettings();
                // Aiio has its own text-size setting; keep the page at 100% so maths and
                // buttons keep their proportions.
                s.setTextZoom(100);
                // The app draws its own light and dark looks: stop the phone recolouring it.
                if (Build.VERSION.SDK_INT >= 33) s.setAlgorithmicDarkeningAllowed(false);
                else if (Build.VERSION.SDK_INT >= 29) s.setForceDark(WebSettings.FORCE_DARK_OFF);
            }
        } catch (Exception ignored) {
            // Older WebViews: nothing to switch off.
        }
    }
}
