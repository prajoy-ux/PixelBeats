package com.pixelbeats.music;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.view.KeyEvent;

/**
 * Handles media control intents sent from notification action buttons,
 * lockscreen, and hardware media keys.
 */
public class PixelBeatsMediaReceiver extends BroadcastReceiver {
    public static final String ACTION_PLAY = "com.pixelbeats.music.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.pixelbeats.music.ACTION_PAUSE";
    public static final String ACTION_TOGGLE = "com.pixelbeats.music.ACTION_TOGGLE";
    public static final String ACTION_PREV = "com.pixelbeats.music.ACTION_PREV";
    public static final String ACTION_NEXT = "com.pixelbeats.music.ACTION_NEXT";
    public static final String ACTION_STOP = "com.pixelbeats.music.ACTION_STOP";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (action == null) return;

        if (Intent.ACTION_MEDIA_BUTTON.equals(action)) {
            KeyEvent keyEvent = intent.getParcelableExtra(Intent.EXTRA_KEY_EVENT);
            if (keyEvent != null && keyEvent.getAction() == KeyEvent.ACTION_DOWN) {
                switch (keyEvent.getKeyCode()) {
                    case KeyEvent.KEYCODE_MEDIA_PLAY:
                        ArchiveTunePlugin.dispatchMediaAction("play", -1);
                        break;
                    case KeyEvent.KEYCODE_MEDIA_PAUSE:
                        ArchiveTunePlugin.dispatchMediaAction("pause", -1);
                        break;
                    case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE:
                    case KeyEvent.KEYCODE_HEADSETHOOK:
                        ArchiveTunePlugin.dispatchMediaAction("toggle", -1);
                        break;
                    case KeyEvent.KEYCODE_MEDIA_NEXT:
                        ArchiveTunePlugin.dispatchMediaAction("next", -1);
                        break;
                    case KeyEvent.KEYCODE_MEDIA_PREVIOUS:
                        ArchiveTunePlugin.dispatchMediaAction("previous", -1);
                        break;
                    case KeyEvent.KEYCODE_MEDIA_STOP:
                        ArchiveTunePlugin.dispatchMediaAction("stop", -1);
                        break;
                }
            }
            return;
        }

        switch (action) {
            case ACTION_PLAY:
                ArchiveTunePlugin.dispatchMediaAction("play", -1);
                break;
            case ACTION_PAUSE:
                ArchiveTunePlugin.dispatchMediaAction("pause", -1);
                break;
            case ACTION_TOGGLE:
                ArchiveTunePlugin.dispatchMediaAction("toggle", -1);
                break;
            case ACTION_PREV:
                ArchiveTunePlugin.dispatchMediaAction("previous", -1);
                break;
            case ACTION_NEXT:
                ArchiveTunePlugin.dispatchMediaAction("next", -1);
                break;
            case ACTION_STOP:
                ArchiveTunePlugin.dispatchMediaAction("stop", -1);
                break;
        }
    }
}
