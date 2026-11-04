package com.pixelbeats.music;

import android.app.Notification;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

/**
 * Foreground Service for PixelBeats background playback.
 * Ensures the Android OS does not kill or throttle the audio process
 * when playing music in the background or with the screen turned off.
 */
public class PixelBeatsMediaService extends Service {
    public static final String ACTION_START_FOREGROUND = "com.pixelbeats.music.ACTION_START_FOREGROUND";
    public static final String ACTION_STOP_FOREGROUND = "com.pixelbeats.music.ACTION_STOP_FOREGROUND";
    public static final String ACTION_DISMISS = "com.pixelbeats.music.ACTION_DISMISS";

    public static final int NOTIFICATION_ID = 4040;
    private static PixelBeatsMediaService instance = null;

    public static PixelBeatsMediaService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START_FOREGROUND.equals(action)) {
                Notification notif = ArchiveTunePlugin.getLastNotification();
                if (notif != null) {
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            startForeground(NOTIFICATION_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                        } else {
                            startForeground(NOTIFICATION_ID, notif);
                        }
                    } catch (Throwable t) {
                        android.util.Log.w("PixelBeatsMediaService", "startForeground notice: " + t.getMessage());
                    }
                }
            } else if (ACTION_STOP_FOREGROUND.equals(action)) {
                try {
                    stopForeground(false);
                } catch (Throwable ignored) {}
            } else if (ACTION_DISMISS.equals(action)) {
                try {
                    stopForeground(true);
                    stopSelf();
                } catch (Throwable ignored) {}
            }
        }
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        instance = null;
        super.onDestroy();
    }
}
