package com.pixelbeats.music;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ArchiveTunePlugin.class);
        super.onCreate(savedInstanceState);

        // Request POST_NOTIFICATIONS runtime permission on Android 13+ so background playback notifications work
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            try {
                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
                }
            } catch (Throwable ignored) {}
        }

        if (getIntent() != null && getIntent().getData() != null) {
            ArchiveTunePlugin.pendingDeepLinkUrl = getIntent().getData().toString();
        }

        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);
                settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            }

            // 1. Partial WakeLock: Keeps CPU clock alive so audio decoding never stalls
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PixelBeats:AudioPlaybackWakeLock");
                wakeLock.setReferenceCounted(false);
                wakeLock.acquire(12 * 60 * 60 * 1000L); // 12 hours timeout
            }

            // 2. High-Performance WifiLock: Prevents Wi-Fi chip power-saving sleep when screen turns off
            WifiManager wifiManager = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wifiManager != null) {
                wifiLock = wifiManager.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "PixelBeats:WifiLock");
                wifiLock.setReferenceCounted(false);
                wifiLock.acquire();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void keepWebViewAlive() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView wv = getBridge().getWebView();
                wv.onResume();
                wv.resumeTimers();
            }
        } catch (Throwable ignored) {}
    }

    @Override
    public void onPause() {
        super.onPause();
        keepWebViewAlive();
    }

    @Override
    public void onStop() {
        super.onStop();
        keepWebViewAlive();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) {
            keepWebViewAlive();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
            if (wifiLock != null && wifiLock.isHeld()) {
                wifiLock.release();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onNewIntent(android.content.Intent intent) {
        super.onNewIntent(intent);
        if (intent != null && intent.getData() != null) {
            ArchiveTunePlugin.handleIncomingDeepLink(intent.getData().toString());
        }
    }
}
