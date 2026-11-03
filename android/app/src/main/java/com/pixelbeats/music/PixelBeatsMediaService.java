package com.pixelbeats.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;

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
    private PowerManager.WakeLock serviceWakeLock = null;

    public static PixelBeatsMediaService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                serviceWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PixelBeats:MediaServiceWakeLock");
                serviceWakeLock.setReferenceCounted(false);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START_FOREGROUND.equals(action)) {
                if (serviceWakeLock != null && !serviceWakeLock.isHeld()) {
                    try { serviceWakeLock.acquire(6 * 60 * 60 * 1000L); /* 6 hrs max */ } catch (Exception ignored) {}
                }
                Notification notif = ArchiveTunePlugin.getLastNotification();
                if (notif == null) {
                    try {
                        String channelId = "pixelbeats_playback_channel";
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            NotificationChannel channel = new NotificationChannel(channelId, "PixelBeats Playback", NotificationManager.IMPORTANCE_LOW);
                            channel.setShowBadge(false);
                            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                            if (nm != null) nm.createNotificationChannel(channel);
                        }
                        notif = new NotificationCompat.Builder(this, channelId)
                            .setContentTitle("PixelBeats")
                            .setContentText("Playing in background")
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setPriority(NotificationCompat.PRIORITY_LOW)
                            .setOngoing(true)
                            .build();
                    } catch (Exception ignored) {}
                }
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
                if (serviceWakeLock != null && serviceWakeLock.isHeld()) {
                    try { serviceWakeLock.release(); } catch (Exception ignored) {}
                }
                try {
                    stopForeground(false);
                } catch (Throwable ignored) {}
            } else if (ACTION_DISMISS.equals(action)) {
                if (serviceWakeLock != null && serviceWakeLock.isHeld()) {
                    try { serviceWakeLock.release(); } catch (Exception ignored) {}
                }
                try {
                    stopForeground(true);
                    stopSelf();
                } catch (Throwable ignored) {}
            }
        }
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        if (serviceWakeLock != null && serviceWakeLock.isHeld()) {
            try { serviceWakeLock.release(); } catch (Exception ignored) {}
        }
        instance = null;
        super.onDestroy();
    }
}
