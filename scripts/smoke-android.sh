#!/usr/bin/env bash
# CI only: install the APK on a running emulator, launch it, and check it stays up.
# Usage: scripts/smoke-android.sh Aiio.apk out-dir
set -u
APK=${1:-Aiio.apk}
OUT=${2:-ci-results}
mkdir -p "$OUT"
adb wait-for-device
adb install -r "$APK"
adb logcat -c
adb shell am start -n com.aiio.app/.MainActivity
sleep 12
adb exec-out screencap -p > "$OUT/launch.png"
# Tap "Start with Chapter 1" (bottom of the first-run screen) and look at Home.
adb shell input tap 540 2200
sleep 4
adb exec-out screencap -p > "$OUT/home.png"
adb shell input keyevent KEYCODE_BACK
sleep 2
adb logcat -d > "$OUT/logcat.txt"
if adb shell pidof com.aiio.app > /dev/null; then
  echo "app is running"
else
  echo "::error::Aiio is not running after launch"
  exit 1
fi
if grep -E "FATAL EXCEPTION|AndroidRuntime: .*com.aiio" "$OUT/logcat.txt"; then
  echo "::error::crash in logcat"
  exit 1
fi
echo "smoke test passed"
