package com.pixelbeats.music;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import android.net.Uri;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ConcurrentHashMap;
import android.media.audiofx.Equalizer;
import android.media.audiofx.BassBoost;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.SystemClock;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/**
 * ArchiveTune Native Engine Plugin for PixelBeats.
 * Runs 100% on-device inside the Android app without needing any PC server or local Wi-Fi!
 */
@CapacitorPlugin(name = "ArchiveTune")
public class ArchiveTunePlugin extends Plugin {

    public static String pendingDeepLinkUrl = null;

    public static void handleIncomingDeepLink(String uriString) {
        pendingDeepLinkUrl = uriString;
        if (activeInstance != null) {
            JSObject data = parseDeepLinkUri(uriString);
            activeInstance.notifyListeners("deepLinkOpen", data);
        }
    }

    @PluginMethod
    public void getPendingDeepLink(PluginCall call) {
        if (pendingDeepLinkUrl != null) {
            JSObject ret = parseDeepLinkUri(pendingDeepLinkUrl);
            pendingDeepLinkUrl = null;
            call.resolve(ret);
        } else {
            call.resolve(new JSObject());
        }
    }

    public static JSObject parseDeepLinkUri(String uriString) {
        JSObject obj = new JSObject();
        obj.put("url", uriString);
        try {
            Uri uri = Uri.parse(uriString);
            String videoId = null;
            if (uri.isHierarchical()) {
                videoId = uri.getQueryParameter("id");
                if (videoId == null) videoId = uri.getQueryParameter("v");
                if (videoId == null) videoId = uri.getQueryParameter("track");
            }
            if (videoId == null) {
                String path = uri.getPath();
                if (path != null && path.length() > 1) {
                    videoId = path.startsWith("/") ? path.substring(1) : path;
                }
            }
            obj.put("videoId", videoId != null ? videoId : "");
            obj.put("title", uri.isHierarchical() && uri.getQueryParameter("title") != null ? uri.getQueryParameter("title") : "");
            obj.put("artist", uri.isHierarchical() && uri.getQueryParameter("artist") != null ? uri.getQueryParameter("artist") : "");
        } catch (Exception e) {
            obj.put("videoId", "");
            obj.put("title", "");
            obj.put("artist", "");
        }
        return obj;
    }

    @Override
    protected void handleOnNewIntent(android.content.Intent intent) {
        super.handleOnNewIntent(intent);
        if (intent != null && intent.getData() != null) {
            handleIncomingDeepLink(intent.getData().toString());
        }
    }


    public static final String NOTIFICATION_CHANNEL_ID = "pixelbeats_playback_channel";
    public static final int NOTIFICATION_ID = 4040;

    private static ArchiveTunePlugin activeInstance = null;
    private static Notification lastNotification = null;

    private MediaSessionCompat mediaSession = null;
    private String currentTitle = "PixelBeats";
    private String currentArtist = "PixelBeats Music";
    private String currentAlbum = "PixelBeats";
    private double currentDuration = 0.0;
    private double currentPosition = 0.0;
    private boolean currentIsPlaying = false;
    private String currentThumbnailUrl = null;
    private Bitmap currentArtworkBitmap = null;

    private static final String IOS_UA = "com.google.ios.youtube/20.03.02 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X; en_US)";
    private static final String DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    public static class StreamDetails {
        public String videoId;
        public String rawUrl;
        public long contentLength;
        public String mimeType;
        public int bitrate;
        public int itag;
        public String title;
        public String artist;
        public String duration;
        public String thumbnail;
        public Double loudnessDb;
        public String userAgent;
    }

    private final ConcurrentHashMap<String, StreamDetails> streamCache = new ConcurrentHashMap<>();
    private ServerSocket serverSocket;
    private int localPort = 0;
    private String cachedVisitorData = null;
    private long visitorDataTime = 0;
    private Equalizer nativeEqualizer = null;
    private BassBoost nativeBassBoost = null;

    @Override
    public void load() {
        super.load();
        activeInstance = this;
        ensureProxyServerStarted();
        initNativeAudioEffects();
        initMediaSession();
    }

    @PluginMethod
    public void shareTrack(PluginCall call) {
        String url = call.getString("url", "");
        String title = call.getString("title", "PixelBeats");
        String text = call.getString("text", title);
        if (url.isEmpty()) {
            call.reject("A song link is required");
            return;
        }
        getActivity().runOnUiThread(() -> {
            try {
                Intent sendIntent = new Intent(Intent.ACTION_SEND);
                sendIntent.setType("text/plain");
                sendIntent.putExtra(Intent.EXTRA_SUBJECT, title);
                sendIntent.putExtra(Intent.EXTRA_TEXT, text + "\n" + url);
                getActivity().startActivity(Intent.createChooser(sendIntent, "Share song"));
                call.resolve();
            } catch (Exception error) {
                call.reject("Unable to open share sheet", error);
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        if (mediaSession != null) {
            try {
                mediaSession.setActive(false);
                mediaSession.release();
            } catch (Throwable ignored) {}
        }
        activeInstance = null;
        super.handleOnDestroy();
    }

    private synchronized void ensureProxyServerStarted() {
        if (serverSocket != null && !serverSocket.isClosed() && localPort > 0) {
            return;
        }
        new Thread(() -> {
            try {
                serverSocket = new ServerSocket(0, 50, InetAddress.getByName("127.0.0.1"));
                localPort = serverSocket.getLocalPort();
                android.util.Log.i("ArchiveTune", "Local audio proxy started on 127.0.0.1:" + localPort);
                while (!serverSocket.isClosed()) {
                    Socket client = serverSocket.accept();
                    new Thread(() -> handleProxyClient(client)).start();
                }
            } catch (Exception e) {
                android.util.Log.e("ArchiveTune", "Local proxy error", e);
            }
        }, "ArchiveTuneProxyServer").start();

        int attempts = 0;
        while (localPort == 0 && attempts < 10) {
            try { Thread.sleep(50); } catch (InterruptedException ignored) {}
            attempts++;
        }
    }

    private synchronized String getVisitorData() {
        if (cachedVisitorData != null && !cachedVisitorData.isEmpty() && (System.currentTimeMillis() - visitorDataTime < 3600000)) {
            return cachedVisitorData;
        }
        try {
            URL url = new URL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestProperty("User-Agent", DESKTOP_UA);
            conn.setConnectTimeout(6000);
            conn.setReadTimeout(6000);
            String html = readStream(conn.getInputStream());
            Matcher m = Pattern.compile("[\"'](?:visitorData|VISITOR_DATA)[\"']:\\s*[\"']([^\"']+)[\"']").matcher(html);
            if (m.find()) {
                cachedVisitorData = m.group(1);
                visitorDataTime = System.currentTimeMillis();
                return cachedVisitorData;
            }
        } catch (Exception e) {
            android.util.Log.w("ArchiveTune", "getVisitorData notice: " + e.getMessage());
        }
        return "";
    }

    private void handleProxyClient(Socket client) {
        try {
            client.setSoTimeout(45000);
            InputStream in = client.getInputStream();
            OutputStream out = client.getOutputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));

            String reqLine = reader.readLine();
            if (reqLine == null) {
                client.close();
                return;
            }

            String[] parts = reqLine.split(" ");
            if (parts.length < 2) {
                client.close();
                return;
            }

            String method = parts[0];
            String path = parts[1];
            String rangeHeader = null;
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                if (line.toLowerCase().startsWith("range:")) {
                    rangeHeader = line.substring(6).trim();
                }
            }

            if ("OPTIONS".equalsIgnoreCase(method)) {
                StringBuilder corsOpt = new StringBuilder();
                corsOpt.append("HTTP/1.1 200 OK\r\n");
                corsOpt.append("Access-Control-Allow-Origin: *\r\n");
                corsOpt.append("Access-Control-Allow-Methods: GET, HEAD, OPTIONS\r\n");
                corsOpt.append("Access-Control-Allow-Headers: Range, Content-Type, Accept, Origin, User-Agent\r\n");
                corsOpt.append("Access-Control-Expose-Headers: Content-Range, Content-Length, Accept-Ranges\r\n");
                corsOpt.append("Access-Control-Max-Age: 86400\r\n");
                corsOpt.append("Content-Length: 0\r\n\r\n");
                out.write(corsOpt.toString().getBytes(StandardCharsets.UTF_8));
                out.flush();
                client.close();
                return;
            }

            if (!path.startsWith("/stream?")) {
                out.write("HTTP/1.1 404 Not Found\r\n\r\n".getBytes(StandardCharsets.UTF_8));
                client.close();
                return;
            }

            String videoId = null;
            int qIdx = path.indexOf("videoId=");
            if (qIdx != -1) {
                videoId = path.substring(qIdx + 8);
                int ampIdx = videoId.indexOf("&");
                if (ampIdx != -1) {
                    videoId = videoId.substring(0, ampIdx);
                }
            }

            if (videoId == null || videoId.isEmpty()) {
                out.write("HTTP/1.1 400 Bad Request\r\n\r\n".getBytes(StandardCharsets.UTF_8));
                client.close();
                return;
            }

            StreamDetails entry = streamCache.get(videoId);
            if (entry == null) {
                entry = fetchStreamFromInnerTube(videoId);
            }
            if (entry == null || entry.rawUrl == null) {
                out.write("HTTP/1.1 404 Not Found\r\n\r\n".getBytes(StandardCharsets.UTF_8));
                client.close();
                return;
            }

            long totalLength = entry.contentLength;
            long start = 0;
            long end = totalLength > 0 ? (totalLength - 1) : -1;

            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                String rVal = rangeHeader.substring(6).trim();
                String[] rParts = rVal.split("-");
                if (rParts.length > 0 && !rParts[0].isEmpty()) {
                    start = Long.parseLong(rParts[0]);
                }
                if (rParts.length > 1 && !rParts[1].isEmpty()) {
                    end = Long.parseLong(rParts[1]);
                }
            }

            if (end == -1) {
                end = totalLength > 0 ? (totalLength - 1) : -1;
            }

            HttpURLConnection chunkConn = (HttpURLConnection) new URL(entry.rawUrl).openConnection();
            if (entry.userAgent != null && !entry.userAgent.isEmpty()) {
                chunkConn.setRequestProperty("User-Agent", entry.userAgent);
            } else {
                chunkConn.setRequestProperty("User-Agent", DESKTOP_UA);
            }

            if (rangeHeader != null) {
                chunkConn.setRequestProperty("Range", rangeHeader);
            } else {
                chunkConn.setRequestProperty("Range", "bytes=0-");
            }
            chunkConn.setConnectTimeout(10000);
            chunkConn.setReadTimeout(35000);

            int respCode = chunkConn.getResponseCode();
            if (respCode != 200 && respCode != 206) {
                out.write(("HTTP/1.1 " + respCode + " Stream Error\r\n\r\n").getBytes(StandardCharsets.UTF_8));
                client.close();
                return;
            }

            long sendLen = (end >= start) ? (end - start + 1) : chunkConn.getContentLengthLong();
            String cRange = chunkConn.getHeaderField("Content-Range");
            if (cRange == null && totalLength > 0) {
                cRange = "bytes " + start + "-" + (end > 0 ? end : (totalLength - 1)) + "/" + totalLength;
            }

            StringBuilder headerBuilder = new StringBuilder();
            headerBuilder.append("HTTP/1.1 206 Partial Content\r\n");
            headerBuilder.append("Content-Type: ").append(entry.mimeType != null ? entry.mimeType : "audio/mp4").append("\r\n");
            headerBuilder.append("Accept-Ranges: bytes\r\n");
            if (cRange != null) {
                headerBuilder.append("Content-Range: ").append(cRange).append("\r\n");
            }
            if (sendLen > 0) {
                headerBuilder.append("Content-Length: ").append(sendLen).append("\r\n");
            }
            headerBuilder.append("Access-Control-Allow-Origin: *\r\n");
            headerBuilder.append("Access-Control-Allow-Methods: GET, HEAD, OPTIONS\r\n");
            headerBuilder.append("Access-Control-Allow-Headers: Range, Content-Type, Accept, Origin, User-Agent\r\n");
            headerBuilder.append("Access-Control-Expose-Headers: Content-Range, Content-Length, Accept-Ranges\r\n");
            headerBuilder.append("Connection: keep-alive\r\n");
            headerBuilder.append("\r\n");

            out.write(headerBuilder.toString().getBytes(StandardCharsets.UTF_8));
            out.flush();

            if ("HEAD".equalsIgnoreCase(method)) {
                client.close();
                return;
            }

            try (InputStream cis = chunkConn.getInputStream()) {
                byte[] buf = new byte[32768];
                int read;
                while ((read = cis.read(buf)) != -1 && !client.isClosed()) {
                    out.write(buf, 0, read);
                    out.flush();
                }
            }

        } catch (Exception ignored) {
        } finally {
            try { client.close(); } catch (Exception ignored) {}
        }
    }

    private StreamDetails fetchStreamFromInnerTube(String videoId) throws Exception {
        // Strategy 1: VISIONOS client with visitorData (plays 100% full songs without 33s stop or 403 blocks)
        try {
            String vData = getVisitorData();
            JSONObject payload = new JSONObject();
            JSONObject context = new JSONObject();
            JSONObject client = new JSONObject();
            client.put("clientName", "VISIONOS");
            client.put("clientVersion", "1.02");
            client.put("deviceMake", "Apple");
            client.put("deviceModel", "RealityDevice17,1");
            client.put("userAgent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15");
            client.put("osName", "visionOS");
            client.put("osVersion", "26.5.23O471");
            if (vData != null && !vData.isEmpty()) {
                client.put("visitorData", vData);
            }
            client.put("hl", "en");
            client.put("gl", "US");
            context.put("client", client);
            payload.put("context", context);
            payload.put("videoId", videoId);

            JSONObject playbackContext = new JSONObject();
            JSONObject contentPlaybackContext = new JSONObject();
            contentPlaybackContext.put("html5Preference", "HTML5_PREF_WANTS");
            playbackContext.put("contentPlaybackContext", contentPlaybackContext);
            payload.put("playbackContext", playbackContext);
            payload.put("contentCheckOk", true);
            payload.put("racyCheckOk", true);

            URL url = new URL("https://www.youtube.com/youtubei/v1/player?prettyPrint=false");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15");
            conn.setRequestProperty("X-YouTube-Client-Name", "101");
            conn.setRequestProperty("X-YouTube-Client-Version", "1.02");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(10000);
            conn.setDoOutput(true);

            byte[] postBytes = payload.toString().getBytes(StandardCharsets.UTF_8);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(postBytes);
            }

            if (conn.getResponseCode() == 200) {
                String responseBody = readStream(conn.getInputStream());
                JSONObject json = new JSONObject(responseBody);
                JSONObject playability = json.optJSONObject("playabilityStatus");
                if (playability != null && "OK".equals(playability.optString("status"))) {
                    JSONObject streamingData = json.optJSONObject("streamingData");
                    if (streamingData != null) {
                        JSONArray adaptiveFormats = streamingData.optJSONArray("adaptiveFormats");
                        if (adaptiveFormats != null && adaptiveFormats.length() > 0) {
                            JSONObject chosen = null;
                            for (int i = 0; i < adaptiveFormats.length(); i++) {
                                JSONObject f = adaptiveFormats.getJSONObject(i);
                                String mime = f.optString("mimeType", "");
                                String fUrl = f.optString("url", "");
                                if (mime.startsWith("audio/") && !fUrl.isEmpty()) {
                                    int itag = f.optInt("itag", 0);
                                    if (itag == 140) {
                                        chosen = f;
                                        break; // Best universal format for Android
                                    } else if (itag == 251 && chosen == null) {
                                        chosen = f;
                                    } else if (chosen == null) {
                                        chosen = f;
                                    }
                                }
                            }
                            if (chosen != null) {
                                StreamDetails d = buildStreamDetails(json, chosen, videoId, "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15");
                                streamCache.put(videoId, d);
                                return d;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            android.util.Log.w("ArchiveTune", "VISIONOS stream resolution fallback: " + e.getMessage());
        }

        // Strategy 2: Proven IOS Client Profile fallback (selecting itag 140)
        JSONObject payload = new JSONObject();
        JSONObject context = new JSONObject();
        JSONObject client = new JSONObject();
        client.put("clientName", "IOS");
        client.put("clientVersion", "20.03.02");
        client.put("deviceMake", "Apple");
        client.put("deviceModel", "iPhone16,2");
        client.put("hl", "en");
        client.put("gl", "US");
        client.put("osName", "iOS");
        client.put("osVersion", "18.3.2.22D82");
        context.put("client", client);
        payload.put("context", context);
        payload.put("videoId", videoId);

        JSONObject playbackContext = new JSONObject();
        JSONObject contentPlaybackContext = new JSONObject();
        contentPlaybackContext.put("html5Preference", "HTML5_PREF_WANTS");
        playbackContext.put("contentPlaybackContext", contentPlaybackContext);
        payload.put("playbackContext", playbackContext);
        payload.put("contentCheckOk", true);
        payload.put("racyCheckOk", true);

        URL url = new URL("https://www.youtube.com/youtubei/v1/player?prettyPrint=false");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("User-Agent", IOS_UA);
        conn.setRequestProperty("X-YouTube-Client-Name", "5");
        conn.setRequestProperty("X-YouTube-Client-Version", "20.03.02");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(12000);
        conn.setDoOutput(true);

        byte[] postBytes = payload.toString().getBytes(StandardCharsets.UTF_8);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(postBytes);
        }

        if (conn.getResponseCode() != 200) {
            throw new Exception("InnerTube player responded with code: " + conn.getResponseCode());
        }

        String responseBody = readStream(conn.getInputStream());
        JSONObject json = new JSONObject(responseBody);

        JSONObject playability = json.optJSONObject("playabilityStatus");
        String status = playability != null ? playability.optString("status") : "";
        if (!"OK".equals(status)) {
            throw new Exception("Playability status is not OK: " + status);
        }

        JSONObject streamingData = json.optJSONObject("streamingData");
        if (streamingData == null) {
            throw new Exception("No streamingData in player response");
        }

        JSONArray adaptiveFormats = streamingData.optJSONArray("adaptiveFormats");
        if (adaptiveFormats == null || adaptiveFormats.length() == 0) {
            throw new Exception("No adaptiveFormats found");
        }

        JSONObject chosenFormat = null;
        for (int i = 0; i < adaptiveFormats.length(); i++) {
            JSONObject f = adaptiveFormats.getJSONObject(i);
            String mime = f.optString("mimeType", "");
            String fUrl = f.optString("url", "");
            if (mime.startsWith("audio/") && !fUrl.isEmpty()) {
                int itag = f.optInt("itag", 0);
                if (itag == 140) {
                    chosenFormat = f;
                    break;
                } else if (itag == 250 && chosenFormat == null) {
                    chosenFormat = f;
                } else if (chosenFormat == null) {
                    chosenFormat = f;
                }
            }
        }

        if (chosenFormat == null) {
            throw new Exception("No valid audio format found with direct URL");
        }

        StreamDetails details = buildStreamDetails(json, chosenFormat, videoId, IOS_UA);
        streamCache.put(videoId, details);
        return details;
    }

    private StreamDetails buildStreamDetails(JSONObject json, JSONObject format, String videoId, String ua) {
        StreamDetails details = new StreamDetails();
        details.videoId = videoId;
        details.rawUrl = format.optString("url");
        details.contentLength = format.optLong("contentLength", 0);
        details.mimeType = format.optString("mimeType", "audio/mp4");
        details.bitrate = format.optInt("bitrate", 128000);
        details.itag = format.optInt("itag", 140);
        details.userAgent = ua;

        JSONObject videoDetails = json.optJSONObject("videoDetails");
        details.title = videoDetails != null ? videoDetails.optString("title", "Unknown Title") : "Unknown Title";
        details.artist = videoDetails != null ? videoDetails.optString("author", "Unknown Artist") : "Unknown Artist";
        long lengthSeconds = videoDetails != null ? videoDetails.optLong("lengthSeconds", 0) : 0;
        details.duration = String.format("%02d:%02d", lengthSeconds / 60, lengthSeconds % 60);

        details.thumbnail = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
        if (videoDetails != null) {
            JSONObject thumbObj = videoDetails.optJSONObject("thumbnail");
            if (thumbObj != null) {
                JSONArray thumbs = thumbObj.optJSONArray("thumbnails");
                if (thumbs != null && thumbs.length() > 0) {
                    JSONObject lastThumb = thumbs.optJSONObject(thumbs.length() - 1);
                    if (lastThumb != null) {
                        details.thumbnail = lastThumb.optString("url", details.thumbnail);
                    }
                }
            }
        }

        JSONObject playerConfig = json.optJSONObject("playerConfig");
        if (playerConfig != null) {
            JSONObject audioCfg = playerConfig.optJSONObject("audioConfig");
            if (audioCfg != null && audioCfg.has("loudnessDb")) {
                details.loudnessDb = audioCfg.optDouble("loudnessDb");
            }
        }

        return details;
    }

    /**
     * Resolves high quality audio stream directly using ArchiveTune's proven iOS client profile.
     * Bypasses YouTube's LOGIN_REQUIRED bot wall on mobile and proxies chunks locally on device.
     */
    @PluginMethod
    public void resolveStream(PluginCall call) {
        String videoId = call.getString("videoId");
        if (videoId == null || videoId.isEmpty()) {
            call.reject("videoId is required");
            return;
        }

        ensureProxyServerStarted();

        new Thread(() -> {
            try {
                StreamDetails details = fetchStreamFromInnerTube(videoId);

                String streamUrl = (localPort > 0)
                        ? "http://127.0.0.1:" + localPort + "/stream?videoId=" + videoId
                        : details.rawUrl;

                JSObject ret = new JSObject();
                ret.put("videoId", videoId);
                ret.put("streamUrl", streamUrl);
                ret.put("rawUrl", details.rawUrl);
                ret.put("title", details.title);
                ret.put("artist", details.artist);
                ret.put("duration", details.duration);
                ret.put("thumbnail", details.thumbnail);
                ret.put("bitrate", details.bitrate);
                ret.put("itag", details.itag);
                ret.put("mimeType", details.mimeType);
                if (details.loudnessDb != null) {
                    ret.put("loudnessDb", details.loudnessDb);
                }
                ret.put("source", "ArchiveTune-Native-Standalone");

                call.resolve(ret);

            } catch (Exception e) {
                call.reject("ArchiveTune stream resolution failed: " + e.getMessage(), e);
            }
        }).start();
    }

    /**
     * Resolves up next automated radio queue from YouTube Music InnerTube.
     * Provides 50 seamless tracks matching the currently played song!
     */
    @PluginMethod
    public void getNextQueue(PluginCall call) {
        String videoId = call.getString("videoId");
        if (videoId == null || videoId.isEmpty()) {
            call.reject("videoId is required");
            return;
        }

        new Thread(() -> {
            try {
                JSONObject payload = new JSONObject();
                JSONObject context = new JSONObject();
                JSONObject client = new JSONObject();
                client.put("clientName", "WEB_REMIX");
                client.put("clientVersion", "1.20240101.01.00");
                client.put("hl", "en");
                client.put("gl", "US");
                context.put("client", client);
                payload.put("context", context);
                payload.put("videoId", videoId);
                payload.put("playlistId", "RDAMVM" + videoId); // Official YouTube Music Radio playlist
                payload.put("isAudioOnly", true);

                URL url = new URL("https://music.youtube.com/youtubei/v1/next?prettyPrint=false");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("User-Agent", DESKTOP_UA);
                conn.setRequestProperty("Referer", "https://music.youtube.com/");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(10000);
                conn.setDoOutput(true);

                byte[] postBytes = payload.toString().getBytes(StandardCharsets.UTF_8);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(postBytes);
                }

                if (conn.getResponseCode() != 200) {
                    call.reject("Next endpoint responded with code: " + conn.getResponseCode());
                    return;
                }

                String responseBody = readStream(conn.getInputStream());
                JSONObject json = new JSONObject(responseBody);
                JSArray tracksArray = new JSArray();

                JSONObject contents = json.optJSONObject("contents");
                if (contents != null) {
                    JSONObject singleCol = contents.optJSONObject("singleColumnMusicWatchNextResultsRenderer");
                    if (singleCol != null) {
                        JSONObject tabbed = singleCol.optJSONObject("tabbedRenderer");
                        if (tabbed != null) {
                            JSONObject watchNext = tabbed.optJSONObject("watchNextTabbedResultsRenderer");
                            if (watchNext != null) {
                                JSONArray tabs = watchNext.optJSONArray("tabs");
                                if (tabs != null && tabs.length() > 0) {
                                    JSONObject tab0 = tabs.getJSONObject(0);
                                    JSONObject tRenderer = tab0.optJSONObject("tabRenderer");
                                    if (tRenderer != null) {
                                        JSONObject content = tRenderer.optJSONObject("content");
                                        if (content != null) {
                                            JSONObject mq = content.optJSONObject("musicQueueRenderer");
                                            if (mq != null) {
                                                JSONObject mqContent = mq.optJSONObject("content");
                                                if (mqContent != null) {
                                                    JSONObject pp = mqContent.optJSONObject("playlistPanelRenderer");
                                                    if (pp != null) {
                                                        JSONArray panelItems = pp.optJSONArray("contents");
                                                        if (panelItems != null) {
                                                            for (int i = 0; i < panelItems.length(); i++) {
                                                                JSONObject item = panelItems.getJSONObject(i);
                                                                JSONObject vr = item.optJSONObject("playlistPanelVideoRenderer");
                                                                if (vr == null) continue;
                                                                String vId = vr.optString("videoId", "");
                                                                if (vId.isEmpty() || vId.equals(videoId)) continue;

                                                                String title = "Unknown Title";
                                                                JSONObject titleObj = vr.optJSONObject("title");
                                                                if (titleObj != null && titleObj.optJSONArray("runs") != null) {
                                                                    title = titleObj.getJSONArray("runs").getJSONObject(0).optString("text", title);
                                                                }

                                                                String artist = "Unknown Artist";
                                                                JSONObject bylineObj = vr.optJSONObject("longBylineText");
                                                                if (bylineObj != null && bylineObj.optJSONArray("runs") != null) {
                                                                    artist = bylineObj.getJSONArray("runs").getJSONObject(0).optString("text", artist);
                                                                }

                                                                String duration = "--:--";
                                                                JSONObject lenObj = vr.optJSONObject("lengthText");
                                                                if (lenObj != null && lenObj.optJSONArray("runs") != null) {
                                                                    duration = lenObj.getJSONArray("runs").getJSONObject(0).optString("text", duration);
                                                                }

                                                                String thumb = "https://i.ytimg.com/vi/" + vId + "/hqdefault.jpg";
                                                                JSONObject thumbObj = vr.optJSONObject("thumbnail");
                                                                if (thumbObj != null && thumbObj.optJSONArray("thumbnails") != null) {
                                                                    JSONArray tArr = thumbObj.getJSONArray("thumbnails");
                                                                    if (tArr.length() > 0) {
                                                                        thumb = tArr.getJSONObject(tArr.length() - 1).optString("url", thumb);
                                                                    }
                                                                }

                                                                JSObject t = new JSObject();
                                                                t.put("videoId", vId);
                                                                t.put("title", title);
                                                                t.put("artist", artist);
                                                                t.put("duration", duration);
                                                                t.put("thumbnail", thumb);
                                                                t.put("album", "Single");
                                                                tracksArray.put(t);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                JSObject ret = new JSObject();
                ret.put("tracks", tracksArray);
                call.resolve(ret);

            } catch (Exception e) {
                call.reject("Failed to fetch next queue: " + e.getMessage(), e);
            }
        }).start();
    }

    /**
     * Direct song search via YouTube Music WEB_REMIX InnerTube endpoint.
     */
    @PluginMethod
    public void search(PluginCall call) {
        String query = call.getString("query");
        if (query == null || query.isEmpty()) {
            call.reject("query is required");
            return;
        }

        new Thread(() -> {
            try {
                JSONObject payload = new JSONObject();
                JSONObject context = new JSONObject();
                JSONObject client = new JSONObject();
                client.put("clientName", "WEB_REMIX");
                client.put("clientVersion", "1.20260101.01.00");
                client.put("hl", "en");
                client.put("gl", "US");
                context.put("client", client);
                payload.put("context", context);
                payload.put("query", query);
                payload.put("params", "EgWKAQIIAWoMCAMQBBAFEAkQChAF"); // Songs filter

                URL url = new URL("https://music.youtube.com/youtubei/v1/search?prettyPrint=false");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("User-Agent", DESKTOP_UA);
                conn.setRequestProperty("Referer", "https://music.youtube.com/");
                conn.setConnectTimeout(8000);
                conn.setReadTimeout(10000);
                conn.setDoOutput(true);

                byte[] postBytes = payload.toString().getBytes(StandardCharsets.UTF_8);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(postBytes);
                }

                if (conn.getResponseCode() != 200) {
                    call.reject("InnerTube search HTTP error: " + conn.getResponseCode());
                    return;
                }

                String responseBody = readStream(conn.getInputStream());
                JSONObject json = new JSONObject(responseBody);
                JSArray tracksArray = new JSArray();

                JSONObject contents = json.optJSONObject("contents");
                if (contents != null) {
                    JSONObject tabbed = contents.optJSONObject("tabbedSearchResultsRenderer");
                    if (tabbed != null) {
                        JSONArray tabs = tabbed.optJSONArray("tabs");
                        if (tabs != null && tabs.length() > 0) {
                            JSONObject tabRenderer = tabs.getJSONObject(0).optJSONObject("tabRenderer");
                            if (tabRenderer != null && tabRenderer.optJSONObject("content") != null) {
                                JSONObject sectionList = tabRenderer.getJSONObject("content").optJSONObject("sectionListRenderer");
                                if (sectionList != null) {
                                    JSONArray sections = sectionList.optJSONArray("contents");
                                    if (sections != null) {
                                        for (int s = 0; s < sections.length(); s++) {
                                            JSONObject shelf = sections.getJSONObject(s).optJSONObject("musicShelfRenderer");
                                            if (shelf == null) continue;
                                            JSONArray items = shelf.optJSONArray("contents");
                                            if (items == null) continue;

                                            for (int i = 0; i < items.length(); i++) {
                                                JSONObject item = items.getJSONObject(i).optJSONObject("musicResponsiveListItemRenderer");
                                                if (item == null) continue;

                                                JSONArray flexCols = item.optJSONArray("flexColumns");
                                                if (flexCols == null || flexCols.length() == 0) continue;

                                                // Col 1: Title and Watch VideoId
                                                JSONObject col1 = flexCols.getJSONObject(0).optJSONObject("musicResponsiveListItemFlexColumnRenderer");
                                                if (col1 == null) continue;
                                                JSONObject col1Text = col1.optJSONObject("text");
                                                if (col1Text == null) continue;
                                                JSONArray runs = col1Text.optJSONArray("runs");
                                                if (runs == null || runs.length() == 0) continue;

                                                JSONObject titleRun = runs.getJSONObject(0);
                                                String title = titleRun.optString("text");
                                                JSONObject nav = titleRun.optJSONObject("navigationEndpoint");
                                                String vid = null;
                                                if (nav != null && nav.optJSONObject("watchEndpoint") != null) {
                                                    vid = nav.getJSONObject("watchEndpoint").optString("videoId");
                                                }
                                                if (vid == null && item.optJSONObject("playlistItemData") != null) {
                                                    vid = item.getJSONObject("playlistItemData").optString("videoId");
                                                }
                                                if (vid == null || vid.isEmpty()) continue;

                                                // Col 2: Artist & duration
                                                String artist = "Unknown Artist";
                                                String duration = "--:--";
                                                String album = "Single";

                                                if (flexCols.length() > 1) {
                                                    JSONObject col2 = flexCols.getJSONObject(1).optJSONObject("musicResponsiveListItemFlexColumnRenderer");
                                                    if (col2 != null && col2.optJSONObject("text") != null) {
                                                        JSONArray c2Runs = col2.getJSONObject("text").optJSONArray("runs");
                                                        if (c2Runs != null && c2Runs.length() > 0) {
                                                            artist = c2Runs.getJSONObject(0).optString("text", "Unknown Artist");
                                                            for (int r = 0; r < c2Runs.length(); r++) {
                                                                String txt = c2Runs.getJSONObject(r).optString("text", "");
                                                                if (txt.contains(":")) {
                                                                    duration = txt;
                                                                }
                                                            }
                                                            if (c2Runs.length() >= 3) {
                                                                String albCand = c2Runs.getJSONObject(2).optString("text", "");
                                                                if (!albCand.equals(duration) && !albCand.equals(" • ")) {
                                                                    album = albCand;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                // Thumbnail
                                                String thumb = "https://i.ytimg.com/vi/" + vid + "/hqdefault.jpg";
                                                JSONObject thumbRenderer = item.optJSONObject("thumbnail");
                                                if (thumbRenderer != null && thumbRenderer.optJSONObject("musicThumbnailRenderer") != null) {
                                                    JSONObject innerThumb = thumbRenderer.getJSONObject("musicThumbnailRenderer").optJSONObject("thumbnail");
                                                    if (innerThumb != null && innerThumb.optJSONArray("thumbnails") != null) {
                                                        JSONArray thList = innerThumb.getJSONArray("thumbnails");
                                                        if (thList.length() > 0) {
                                                            thumb = thList.getJSONObject(thList.length() - 1).optString("url", thumb);
                                                        }
                                                    }
                                                }
                                                if (thumb.contains("=w120-h120")) {
                                                    thumb = thumb.replace("=w120-h120", "=w544-h544");
                                                }

                                                JSObject trackObj = new JSObject();
                                                trackObj.put("videoId", vid);
                                                trackObj.put("title", title);
                                                trackObj.put("artist", artist);
                                                trackObj.put("album", album);
                                                trackObj.put("duration", duration);
                                                trackObj.put("thumbnail", thumb);

                                                tracksArray.put(trackObj);
                                                if (tracksArray.length() >= 25) break;
                                            }
                                            if (tracksArray.length() >= 25) break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                JSObject ret = new JSObject();
                ret.put("tracks", tracksArray);
                call.resolve(ret);

            } catch (Exception e) {
                call.reject("ArchiveTune search failed: " + e.getMessage(), e);
            }
        }).start();
    }

    /**
     * Direct Synchronized Lyrics lookup via LRCLib and SimpMusic on-device.
     */
    @PluginMethod
    public void getLyrics(PluginCall call) {
        String videoId = call.getString("videoId");
        String rawTitle = call.getString("title", "");
        String rawArtist = call.getString("artist", "");
        int durationSec = call.getInt("duration", 0);

        new Thread(() -> {
            try {
                String cleanTitle = cleanSongTitle(rawTitle);
                String primaryArtist = cleanArtistName(rawArtist);

                String qTitle = URLEncoder.encode(cleanTitle, "UTF-8");
                String qArtist = URLEncoder.encode(primaryArtist, "UTF-8");

                // 1. Try LRCLib exact match
                try {
                    String getUrl = "https://lrclib.net/api/get?track_name=" + qTitle + "&artist_name=" + qArtist;
                    if (durationSec > 0) {
                        getUrl += "&duration=" + durationSec;
                    }
                    URL lrcUrl = new URL(getUrl);
                    HttpURLConnection lrcConn = (HttpURLConnection) lrcUrl.openConnection();
                    lrcConn.setRequestProperty("User-Agent", "ArchiveTune/1.0");
                    lrcConn.setConnectTimeout(2500);
                    lrcConn.setReadTimeout(3000);

                    if (lrcConn.getResponseCode() == 200) {
                        String body = readStream(lrcConn.getInputStream());
                        JSONObject lrcObj = new JSONObject(body);
                        if (lrcObj.optBoolean("instrumental", false)) {
                            JSArray lines = new JSArray();
                            JSObject line = new JSObject();
                            line.put("time", 0.0);
                            line.put("text", "♪ Instrumental ♪");
                            lines.put(line);
                            JSObject res = new JSObject();
                            res.put("source", "LRCLib");
                            res.put("lines", lines);
                            call.resolve(res);
                            return;
                        }
                        String synced = lrcObj.optString("syncedLyrics", "");
                        if (!synced.isEmpty()) {
                            JSArray lines = parseLrc(synced);
                            if (lines.length() > 0) {
                                JSObject res = new JSObject();
                                res.put("source", "LRCLib");
                                res.put("lines", lines);
                                call.resolve(res);
                                return;
                            }
                        }
                    }
                } catch (Exception ignored) {}

                // 2. Try LRCLib search API with strict duration & version scoring
                try {
                    String sUrl = "https://lrclib.net/api/search?track_name=" + qTitle + "&artist_name=" + qArtist;
                    URL searchUrl = new URL(sUrl);
                    HttpURLConnection sConn = (HttpURLConnection) searchUrl.openConnection();
                    sConn.setRequestProperty("User-Agent", "ArchiveTune/1.0");
                    sConn.setConnectTimeout(2500);
                    sConn.setReadTimeout(3000);

                    if (sConn.getResponseCode() == 200) {
                        String body = readStream(sConn.getInputStream());
                        JSONArray arr = new JSONArray(body);
                        JSONObject bestCandidate = null;
                        int bestScore = -999;

                        boolean targetWantsVariant = rawTitle.matches("(?i).*(refix|remix|acoustic|cover|slowed|reverb|live|mashup).*");

                        for (int i = 0; i < arr.length(); i++) {
                            JSONObject item = arr.getJSONObject(i);
                            String synced = item.optString("syncedLyrics", "");
                            if (synced.isEmpty()) continue;

                            String cTrack = item.optString("trackName", item.optString("name", ""));
                            int cDur = item.optInt("duration", 0);
                            int score = 50; // base score for having synced lyrics

                            boolean candidateIsVariant = cTrack.matches("(?i).*(refix|remix|acoustic|cover|slowed|reverb|live|mashup).*");
                            if (candidateIsVariant && !targetWantsVariant) {
                                score -= 100; // penalize remixes/refixes when looking for original
                            }

                            if (durationSec > 0 && cDur > 0) {
                                int diff = Math.abs(cDur - durationSec);
                                if (diff <= 4) {
                                    score += 60;
                                } else if (diff <= 10) {
                                    score += 30;
                                } else if (diff > 35) {
                                    score -= 60;
                                }
                            }

                            if (score > bestScore) {
                                bestScore = score;
                                bestCandidate = item;
                            }
                        }

                        if (bestCandidate != null && bestScore > 0) {
                            String synced = bestCandidate.optString("syncedLyrics", "");
                            JSArray lines = parseLrc(synced);
                            if (lines.length() > 0) {
                                JSObject res = new JSObject();
                                res.put("source", "LRCLib");
                                res.put("lines", lines);
                                call.resolve(res);
                                return;
                            }
                        }
                    }
                } catch (Exception ignored) {}

                // Empty fallback
                JSObject emptyRes = new JSObject();
                emptyRes.put("source", "none");
                emptyRes.put("lines", new JSArray());
                call.resolve(emptyRes);

            } catch (Exception e) {
                JSObject emptyRes = new JSObject();
                emptyRes.put("source", "error");
                emptyRes.put("lines", new JSArray());
                call.resolve(emptyRes);
            }
        }).start();
    }

    private String cleanSongTitle(String title) {
        if (title == null) return "";
        return title.replaceAll("(?i)\\s*\\([Ff]rom\\s+[\"']?[^\"'\\)]+[\"']?\\)", "")
                    .replaceAll("(?i)\\s*\\[[Ff]rom\\s+[\"']?[^\"'\\]]+[\"']?\\]", "")
                    .replaceAll("(?i)\\((Official|Lyric|Audio|Video|Visualizer|HD|4K|feat\\..*?|ft\\..*?|Remastered|Full Song)\\)", "")
                    .replaceAll("(?i)\\[(Official|Lyric|Audio|Video|Visualizer|HD|4K|feat\\..*?|ft\\..*?|Remastered|Full Song)\\]", "")
                    .replaceAll("(?i)\\s*-\\s*(Topic|T-Series|Sony Music|Zee Music|Tips Official|YRF).*", "")
                    .replaceAll("[\"']", "")
                    .trim();
    }

    private String cleanArtistName(String artist) {
        if (artist == null) return "";
        String clean = artist.replaceAll("(?i)\\s*-\\s*topic$", "").trim();
        // Extract primary artist if multiple are listed
        String[] parts = clean.split("(?i)[,&/|]|\\s+(?:ft\\.?|feat\\.?|and)\\s+");
        if (parts.length > 0 && !parts[0].trim().isEmpty()) {
            return parts[0].trim();
        }
        return clean;
    }

    private JSArray parseLrc(String lrcText) {
        JSArray result = new JSArray();
        if (lrcText == null) return result;
        Pattern tagPattern = Pattern.compile("\\[(\\d{1,2}):(\\d{2})(?:[.:](\\d{1,3}))?\\]");
        String[] lines = lrcText.split("\\r?\\n");
        for (String raw : lines) {
            String line = raw.trim();
            if (line.isEmpty()) continue;
            Matcher m = tagPattern.matcher(line);
            java.util.List<Double> timestamps = new java.util.ArrayList<>();
            int lastEnd = 0;
            while (m.find()) {
                int mins = Integer.parseInt(m.group(1));
                int secs = Integer.parseInt(m.group(2));
                int millis = 0;
                String msStr = m.group(3);
                if (msStr != null && !msStr.isEmpty()) {
                    if (msStr.length() == 1) millis = Integer.parseInt(msStr) * 100;
                    else if (msStr.length() == 2) millis = Integer.parseInt(msStr) * 10;
                    else millis = Integer.parseInt(msStr.substring(0, 3));
                }
                double totalSec = mins * 60 + secs + (millis / 1000.0);
                timestamps.add(Math.round(totalSec * 100.0) / 100.0);
                lastEnd = m.end();
            }
            String text = line.substring(lastEnd).trim();
            if (!timestamps.isEmpty() && !text.isEmpty()) {
                for (Double t : timestamps) {
                    JSObject lineObj = new JSObject();
                    lineObj.put("time", t);
                    lineObj.put("text", text);
                    result.put(lineObj);
                }
            }
        }
        return result;
    }

    private String readStream(InputStream is) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        reader.close();
        return sb.toString();
    }

    private synchronized void initNativeAudioEffects() {
        if (nativeEqualizer == null) {
            try {
                nativeEqualizer = new Equalizer(1000, 0);
                nativeEqualizer.setEnabled(true);
                android.util.Log.i("ArchiveTune", "Native Android Equalizer linked to audio session 0");
            } catch (Throwable t) {
                android.util.Log.w("ArchiveTune", "Native Equalizer init: " + t.getMessage());
            }
        }
        if (nativeBassBoost == null) {
            try {
                nativeBassBoost = new BassBoost(1000, 0);
                nativeBassBoost.setEnabled(true);
                android.util.Log.i("ArchiveTune", "Native Android BassBoost linked to audio session 0");
            } catch (Throwable t) {
                android.util.Log.w("ArchiveTune", "Native BassBoost init: " + t.getMessage());
            }
        }
    }

    /**
     * Hardware Equalizer and Bass Boost controls directly operating on Android audio DSP.
     */
    @PluginMethod
    public void setEqualizerPreset(PluginCall call) {
        String preset = call.getString("preset", "flat");
        initNativeAudioEffects();

        try {
            if (nativeBassBoost != null) {
                nativeBassBoost.setEnabled(true);
                if ("bass".equalsIgnoreCase(preset) || "bass_boost".equalsIgnoreCase(preset)) {
                    nativeBassBoost.setStrength((short) 1000); // 100% full hardware bass boost!
                } else if ("warmth".equalsIgnoreCase(preset) || "lofi".equalsIgnoreCase(preset)) {
                    nativeBassBoost.setStrength((short) 650);
                } else if ("acoustic".equalsIgnoreCase(preset)) {
                    nativeBassBoost.setStrength((short) 250);
                } else if ("vocal".equalsIgnoreCase(preset)) {
                    nativeBassBoost.setStrength((short) 100);
                } else {
                    nativeBassBoost.setStrength((short) 0);
                }
            }

            if (nativeEqualizer != null) {
                nativeEqualizer.setEnabled(true);
                short numBands = nativeEqualizer.getNumberOfBands();
                short[] range = nativeEqualizer.getBandLevelRange();
                short minLevel = (range != null && range.length >= 1) ? range[0] : (short) -1500;
                short maxLevel = (range != null && range.length >= 2) ? range[1] : (short) 1500;

                for (short b = 0; b < numBands; b++) {
                    int centerFreqHz = nativeEqualizer.getCenterFreq(b) / 1000;
                    short targetMb = 0;

                    if ("bass".equalsIgnoreCase(preset) || "bass_boost".equalsIgnoreCase(preset)) {
                        if (centerFreqHz < 200) targetMb = (short) Math.min(maxLevel, 1000); // +10dB sub-bass
                        else if (centerFreqHz < 600) targetMb = (short) Math.min(maxLevel, 600); // +6dB bass
                        else if (centerFreqHz > 3000) targetMb = (short) Math.min(maxLevel, 200);
                    } else if ("acoustic".equalsIgnoreCase(preset)) {
                        if (centerFreqHz < 300) targetMb = (short) Math.min(maxLevel, 400);
                        else if (centerFreqHz < 1500) targetMb = (short) 100;
                        else if (centerFreqHz < 5000) targetMb = (short) Math.min(maxLevel, 500);
                        else targetMb = (short) Math.min(maxLevel, 600);
                    } else if ("warmth".equalsIgnoreCase(preset) || "lofi".equalsIgnoreCase(preset)) {
                        if (centerFreqHz < 300) targetMb = (short) Math.min(maxLevel, 600);
                        else if (centerFreqHz < 1000) targetMb = (short) Math.min(maxLevel, 300);
                        else if (centerFreqHz > 3000) targetMb = (short) Math.max(minLevel, -800);
                    } else if ("vocal".equalsIgnoreCase(preset)) {
                        if (centerFreqHz < 300) targetMb = (short) Math.max(minLevel, -200);
                        else if (centerFreqHz >= 1000 && centerFreqHz <= 4500) targetMb = (short) Math.min(maxLevel, 900);
                        else if (centerFreqHz > 4500) targetMb = (short) Math.min(maxLevel, 500);
                    }

                    targetMb = (short) Math.max(minLevel, Math.min(maxLevel, targetMb));
                    nativeEqualizer.setBandLevel(b, targetMb);
                }
            }

            JSObject res = new JSObject();
            res.put("preset", preset);
            res.put("appliedNative", true);
            call.resolve(res);
        } catch (Exception e) {
            android.util.Log.e("ArchiveTune", "Failed setting native EQ preset", e);
            JSObject res = new JSObject();
            res.put("preset", preset);
            res.put("error", e.getMessage());
            call.resolve(res);
        }
    }

    /**
     * Direct 5-band Graphic Equalizer control operating on Android audio DSP hardware.
     */
    @PluginMethod
    public void setEqualizerBands(PluginCall call) {
        initNativeAudioEffects();
        try {
            JSArray bands = call.getArray("bands");
            if (bands != null && nativeEqualizer != null) {
                nativeEqualizer.setEnabled(true);
                short numBands = nativeEqualizer.getNumberOfBands();
                short[] range = nativeEqualizer.getBandLevelRange();
                short minLevel = (range != null && range.length >= 1) ? range[0] : (short) -1500;
                short maxLevel = (range != null && range.length >= 2) ? range[1] : (short) 1500;

                for (short b = 0; b < numBands && b < bands.length(); b++) {
                    double db = bands.getDouble(b);
                    short targetMb = (short) Math.round(db * 100);
                    targetMb = (short) Math.max(minLevel, Math.min(maxLevel, targetMb));
                    nativeEqualizer.setBandLevel(b, targetMb);
                }
            }

            if (bands != null && bands.length() > 0 && nativeBassBoost != null) {
                double subBassDb = bands.getDouble(0);
                if (subBassDb > 0) {
                    short boostStrength = (short) Math.min(1000, Math.round((subBassDb / 12.0) * 1000));
                    nativeBassBoost.setEnabled(true);
                    nativeBassBoost.setStrength(boostStrength);
                } else {
                    nativeBassBoost.setStrength((short) 0);
                }
            }

            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            android.util.Log.e("ArchiveTune", "Failed setting native EQ bands", e);
            JSObject res = new JSObject();
            res.put("success", false);
            res.put("error", e.getMessage());
            call.resolve(res);
        }
    }

    public static Notification getLastNotification() {
        return lastNotification;
    }

    public static void dispatchMediaAction(String action, double position) {
        if (activeInstance != null) {
            activeInstance.handleMediaActionInternal(action, position);
        }
    }

    private void handleMediaActionInternal(String action, double position) {
        if ("play".equals(action)) {
            currentIsPlaying = true;
            updateNativePlaybackStateOnly(true, currentPosition);
            rebuildNotification();
        } else if ("pause".equals(action)) {
            currentIsPlaying = false;
            updateNativePlaybackStateOnly(false, currentPosition);
            rebuildNotification();
        } else if ("toggle".equals(action)) {
            currentIsPlaying = !currentIsPlaying;
            updateNativePlaybackStateOnly(currentIsPlaying, currentPosition);
            rebuildNotification();
            action = currentIsPlaying ? "play" : "pause";
        }

        JSObject data = new JSObject();
        data.put("action", action);
        if (position >= 0) {
            data.put("position", position);
        }
        notifyListeners("mediaAction", data);
    }

    private synchronized void initMediaSession() {
        Context ctx = getContext();
        if (ctx == null) return;

        createNotificationChannel();

        if (mediaSession == null) {
            mediaSession = new MediaSessionCompat(ctx, "PixelBeatsMediaSession");
            mediaSession.setFlags(
                MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS |
                MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
            );

            mediaSession.setCallback(new MediaSessionCompat.Callback() {
                @Override
                public void onPlay() {
                    dispatchMediaAction("play", -1);
                }

                @Override
                public void onPause() {
                    dispatchMediaAction("pause", -1);
                }

                @Override
                public void onSkipToNext() {
                    dispatchMediaAction("next", -1);
                }

                @Override
                public void onSkipToPrevious() {
                    dispatchMediaAction("previous", -1);
                }

                @Override
                public void onSeekTo(long posMs) {
                    double posSec = Math.max(0, posMs / 1000.0);
                    currentPosition = posSec;
                    updateNativePlaybackStateOnly(currentIsPlaying, currentPosition);
                    dispatchMediaAction("seek", posSec);
                }

                @Override
                public void onStop() {
                    dispatchMediaAction("stop", -1);
                }
            });

            mediaSession.setActive(true);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Playback Controls",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("PixelBeats background playback and lockscreen media controls");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void updateNativePlaybackStateOnly(boolean isPlaying, double positionSec) {
        if (mediaSession == null) return;
        long actions = PlaybackStateCompat.ACTION_PLAY |
                       PlaybackStateCompat.ACTION_PAUSE |
                       PlaybackStateCompat.ACTION_PLAY_PAUSE |
                       PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                       PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                       PlaybackStateCompat.ACTION_SEEK_TO |
                       PlaybackStateCompat.ACTION_STOP;

        int state = isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        float speed = isPlaying ? 1.0f : 0.0f;
        long posMs = (long) Math.max(0, positionSec * 1000.0);

        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(state, posMs, speed, SystemClock.elapsedRealtime());

        mediaSession.setPlaybackState(stateBuilder.build());
    }

    private void updateNativeMetadata(String title, String artist, String album, double durationSec, Bitmap art) {
        if (mediaSession == null) return;
        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder();
        metaBuilder.putString(MediaMetadataCompat.METADATA_KEY_TITLE, title);
        metaBuilder.putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist);
        metaBuilder.putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album != null ? album : "PixelBeats");
        metaBuilder.putString(MediaMetadataCompat.METADATA_KEY_ALBUM_ARTIST, artist);
        long durMs = (long) Math.max(0, durationSec * 1000.0);
        metaBuilder.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, durMs);

        if (art != null) {
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, art);
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, art);
        }
        mediaSession.setMetadata(metaBuilder.build());
    }

    public synchronized Notification buildNotification() {
        Context ctx = getContext();
        if (ctx == null || mediaSession == null) return null;

        Intent openAppIntent = new Intent(ctx, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            ctx, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent prevIntent = new Intent(ctx, PixelBeatsMediaReceiver.class).setAction(PixelBeatsMediaReceiver.ACTION_PREV);
        PendingIntent prevPI = PendingIntent.getBroadcast(
            ctx, 10, prevIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent toggleIntent = new Intent(ctx, PixelBeatsMediaReceiver.class).setAction(PixelBeatsMediaReceiver.ACTION_TOGGLE);
        PendingIntent togglePI = PendingIntent.getBroadcast(
            ctx, 11, toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Intent nextIntent = new Intent(ctx, PixelBeatsMediaReceiver.class).setAction(PixelBeatsMediaReceiver.ACTION_NEXT);
        PendingIntent nextPI = PendingIntent.getBroadcast(
            ctx, 12, nextIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        androidx.media.app.NotificationCompat.MediaStyle mediaStyle = new androidx.media.app.NotificationCompat.MediaStyle()
            .setMediaSession(mediaSession.getSessionToken())
            .setShowActionsInCompactView(0, 1, 2);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_pixelbeats_notification)
            .setContentTitle(currentTitle != null && !currentTitle.isEmpty() ? currentTitle : "PixelBeats")
            .setContentText(currentArtist != null && !currentArtist.isEmpty() ? currentArtist : "Now Playing")
            .setSubText(currentAlbum != null && !currentAlbum.isEmpty() ? currentAlbum : "PixelBeats")
            .setContentIntent(contentIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(currentIsPlaying)
            .setOnlyAlertOnce(true)
            .addAction(R.drawable.ic_skip_previous, "Previous", prevPI)
            .addAction(currentIsPlaying ? R.drawable.ic_pause : R.drawable.ic_play_arrow, currentIsPlaying ? "Pause" : "Play", togglePI)
            .addAction(R.drawable.ic_skip_next, "Next", nextPI)
            .setStyle(mediaStyle);

        if (currentArtworkBitmap != null) {
            builder.setLargeIcon(currentArtworkBitmap);
        } else {
            try {
                Bitmap fallback = BitmapFactory.decodeResource(ctx.getResources(), R.mipmap.ic_launcher);
                if (fallback != null) builder.setLargeIcon(fallback);
            } catch (Throwable ignored) {}
        }

        Notification notif = builder.build();
        lastNotification = notif;
        return notif;
    }

    public synchronized void rebuildNotification() {
        Context ctx = getContext();
        if (ctx == null) return;

        Notification notif = buildNotification();
        if (notif == null) return;

        try {
            NotificationManagerCompat.from(ctx).notify(NOTIFICATION_ID, notif);
        } catch (Throwable t) {
            android.util.Log.w("ArchiveTune", "notify notice: " + t.getMessage());
        }

        try {
            if (currentIsPlaying) {
                Intent sIntent = new Intent(ctx, PixelBeatsMediaService.class);
                sIntent.setAction(PixelBeatsMediaService.ACTION_START_FOREGROUND);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ctx.startForegroundService(sIntent);
                } else {
                    ctx.startService(sIntent);
                }
            } else {
                Intent sIntent = new Intent(ctx, PixelBeatsMediaService.class);
                sIntent.setAction(PixelBeatsMediaService.ACTION_STOP_FOREGROUND);
                ctx.startService(sIntent);
            }
        } catch (Throwable t) {
            android.util.Log.w("ArchiveTune", "Service notice: " + t.getMessage());
        }
    }

    private Bitmap loadBitmap(String urlStr) {
        if (urlStr == null || urlStr.trim().isEmpty()) return null;
        try {
            if (urlStr.startsWith("data:image")) {
                int commaIdx = urlStr.indexOf(',');
                if (commaIdx >= 0) {
                    byte[] decoded = android.util.Base64.decode(urlStr.substring(commaIdx + 1), android.util.Base64.DEFAULT);
                    Bitmap bmp = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);
                    if (bmp != null) {
                        return Bitmap.createScaledBitmap(bmp, 512, 512, true);
                    }
                }
            } else if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
                URL url = new URL(urlStr);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestProperty("User-Agent", DESKTOP_UA);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setDoInput(true);
                conn.connect();
                InputStream in = conn.getInputStream();
                Bitmap bmp = BitmapFactory.decodeStream(in);
                in.close();
                if (bmp != null) {
                    return Bitmap.createScaledBitmap(bmp, 512, 512, true);
                }
            }
        } catch (Throwable t) {
            android.util.Log.w("ArchiveTune", "Artwork decode notice: " + t.getMessage());
        }
        return null;
    }

    @PluginMethod
    public void updateMediaSession(PluginCall call) {
        initMediaSession();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && getActivity() != null) {
            try {
                if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(getActivity(), new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
                }
            } catch (Throwable ignored) {}
        }

        String title = call.getString("title", "PixelBeats");
        String artist = call.getString("artist", "PixelBeats Music");
        String album = call.getString("album", "PixelBeats");
        Double duration = call.getDouble("duration", 0.0);
        Double position = call.getDouble("position", 0.0);
        Boolean isPlaying = call.getBoolean("isPlaying", true);
        String thumbnail = call.getString("thumbnail", "");

        currentTitle = title;
        currentArtist = artist;
        currentAlbum = album;
        currentDuration = duration != null ? duration : 0.0;
        currentPosition = position != null ? position : 0.0;
        currentIsPlaying = isPlaying != null ? isPlaying : false;

        // Immediate notification rebuild ensures foreground service is active in 0ms
        updateNativeMetadata(currentTitle, currentArtist, currentAlbum, currentDuration, currentArtworkBitmap);
        updateNativePlaybackStateOnly(currentIsPlaying, currentPosition);
        rebuildNotification();

        if (thumbnail != null && !thumbnail.isEmpty() && !thumbnail.equals(currentThumbnailUrl)) {
            currentThumbnailUrl = thumbnail;
            new Thread(() -> {
                Bitmap bmp = loadBitmap(thumbnail);
                if (bmp != null) {
                    currentArtworkBitmap = bmp;
                    updateNativeMetadata(currentTitle, currentArtist, currentAlbum, currentDuration, currentArtworkBitmap);
                    rebuildNotification();
                }
            }, "ArtworkLoader").start();
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void updatePlaybackState(PluginCall call) {
        Boolean isPlaying = call.getBoolean("isPlaying");
        Double position = call.getDouble("position");
        Double duration = call.getDouble("duration");

        boolean stateChanged = false;
        if (isPlaying != null && isPlaying != currentIsPlaying) {
            currentIsPlaying = isPlaying;
            stateChanged = true;
        }
        if (position != null) {
            currentPosition = position;
        }
        if (duration != null && duration > 0 && Math.abs(duration - currentDuration) > 1.0) {
            currentDuration = duration;
            updateNativeMetadata(currentTitle, currentArtist, currentAlbum, currentDuration, currentArtworkBitmap);
        }

        updateNativePlaybackStateOnly(currentIsPlaying, currentPosition);

        if (stateChanged) {
            rebuildNotification();
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void hideMediaNotification(PluginCall call) {
        currentIsPlaying = false;
        updateNativePlaybackStateOnly(false, currentPosition);
        try {
            NotificationManagerCompat.from(getContext()).cancel(NOTIFICATION_ID);
        } catch (Throwable ignored) {}
        try {
            Intent sIntent = new Intent(getContext(), PixelBeatsMediaService.class);
            sIntent.setAction(PixelBeatsMediaService.ACTION_DISMISS);
            getContext().startService(sIntent);
        } catch (Throwable ignored) {}

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void downloadAndInstallUpdate(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("Missing APK download URL");
            return;
        }

        new Thread(() -> {
            HttpURLConnection conn = null;
            InputStream in = null;
            FileOutputStream out = null;
            try {
                // Follow redirects (GitHub releases redirect to AWS S3 CDN)
                String currentUrl = apkUrl;
                int redirects = 0;
                while (redirects < 6) {
                    URL u = new URL(currentUrl);
                    conn = (HttpURLConnection) u.openConnection();
                    conn.setInstanceFollowRedirects(true);
                    conn.setRequestProperty("User-Agent", "PixelBeats-Updater/1.0");
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(30000);
                    int code = conn.getResponseCode();
                    if (code == HttpURLConnection.HTTP_MOVED_PERM || code == HttpURLConnection.HTTP_MOVED_TEMP || code == 307 || code == 308) {
                        currentUrl = conn.getHeaderField("Location");
                        redirects++;
                        conn.disconnect();
                    } else {
                        break;
                    }
                }

                if (conn.getResponseCode() != 200) {
                    call.reject("HTTP download error: " + conn.getResponseCode());
                    return;
                }

                long totalBytes = conn.getContentLengthLong();
                File cacheDir = getContext().getExternalCacheDir();
                if (cacheDir == null) {
                    cacheDir = getContext().getCacheDir();
                }
                File apkFile = new File(cacheDir, "PixelBeats_Update.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                in = conn.getInputStream();
                out = new FileOutputStream(apkFile);
                byte[] buffer = new byte[32768];
                long downloaded = 0;
                int read;
                long lastNotifyTime = 0;

                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    downloaded += read;
                    long now = SystemClock.elapsedRealtime();
                    if (now - lastNotifyTime > 120 || downloaded == totalBytes) {
                        lastNotifyTime = now;
                        int percent = totalBytes > 0 ? (int) ((downloaded * 100) / totalBytes) : -1;
                        JSObject progress = new JSObject();
                        progress.put("percent", percent);
                        progress.put("downloaded", downloaded);
                        progress.put("total", totalBytes);
                        notifyListeners("updateDownloadProgress", progress);
                    }
                }
                out.flush();

                // APK downloaded successfully, trigger system package installer
                boolean launched = launchApkInstaller(apkFile);

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("launched", launched);
                call.resolve(ret);

            } catch (Exception e) {
                call.reject("Failed to download and install update: " + e.getMessage());
            } finally {
                try { if (in != null) in.close(); } catch (Exception ignored) {}
                try { if (out != null) out.close(); } catch (Exception ignored) {}
                try { if (conn != null) conn.disconnect(); } catch (Exception ignored) {}
            }
        }).start();
    }

    private boolean launchApkInstaller(File apkFile) {
        try {
            Context ctx = getContext();
            Uri contentUri = FileProvider.getUriForFile(
                ctx,
                ctx.getPackageName() + ".fileprovider",
                apkFile
            );

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(contentUri, "application/vnd.android.package-archive");
            installIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);

            // On Android 8.0+ (Oreo), verify unknown sources permission
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!ctx.getPackageManager().canRequestPackageInstalls()) {
                    Intent permIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + ctx.getPackageName()));
                    permIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(permIntent);
                }
            }

            ctx.startActivity(installIntent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @PluginMethod
    public void importPlaylist(PluginCall call) {
        String inputUrl = call.getString("url");
        if (inputUrl == null || inputUrl.trim().isEmpty()) {
            call.reject("URL or ID is required");
            return;
        }

        final String query = inputUrl.trim();

        new Thread(() -> {
            try {
                // 1. Check if it contains a playlist ID
                String playlistId = null;
                Pattern pList = Pattern.compile("(?:list=|/playlist\\?list=)([a-zA-Z0-9_-]+)");
                Matcher mList = pList.matcher(query);
                if (mList.find()) {
                    playlistId = mList.group(1);
                } else if (query.startsWith("PL") || query.startsWith("VL") || query.startsWith("OLAK") || query.startsWith("RD")) {
                    playlistId = query;
                }

                if (playlistId != null) {
                    String browseId = playlistId.startsWith("VL") ? playlistId : "VL" + playlistId;

                    JSONObject payload = new JSONObject();
                    JSONObject context = new JSONObject();
                    JSONObject client = new JSONObject();
                    client.put("clientName", "WEB_REMIX");
                    client.put("clientVersion", "1.20240101.01.00");
                    client.put("hl", "en");
                    client.put("gl", "US");
                    context.put("client", client);
                    payload.put("context", context);
                    payload.put("browseId", browseId);

                    URL u = new URL("https://music.youtube.com/youtubei/v1/browse?prettyPrint=false");
                    HttpURLConnection conn = (HttpURLConnection) u.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(12000);
                    conn.setReadTimeout(18000);

                    try (OutputStream os = conn.getOutputStream()) {
                        os.write(payload.toString().getBytes(StandardCharsets.UTF_8));
                    }

                    if (conn.getResponseCode() == 200) {
                        String body = readStream(conn.getInputStream());
                        JSONObject root = new JSONObject(body);

                        JSArray tracksArray = new JSArray();
                        extractTracksFromBrowseJson(root, tracksArray);

                        if (tracksArray.length() > 0) {
                            JSObject ret = new JSObject();
                            ret.put("success", true);
                            ret.put("type", "playlist");
                            ret.put("tracks", tracksArray);
                            call.resolve(ret);
                            return;
                        }
                    }
                }

                // 2. Check if it's a single video URL
                String videoId = null;
                Pattern pVideo = Pattern.compile("(?:v=|youtu\\.be/|embed/|shorts/|watch/)([a-zA-Z0-9_-]{11})");
                Matcher mVideo = pVideo.matcher(query);
                if (mVideo.find()) {
                    videoId = mVideo.group(1);
                } else if (query.matches("^[a-zA-Z0-9_-]{11}$")) {
                    videoId = query;
                }

                if (videoId != null) {
                    StreamDetails details = fetchStreamFromInnerTube(videoId);
                    if (details != null && details.title != null) {
                        JSArray singleList = new JSArray();
                        JSObject trackObj = new JSObject();
                        trackObj.put("videoId", videoId);
                        trackObj.put("title", details.title);
                        trackObj.put("artist", details.artist != null ? details.artist : "YouTube");
                        trackObj.put("duration", details.duration != null ? details.duration : "03:00");
                        trackObj.put("thumbnail", details.thumbnail != null ? details.thumbnail : "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg");
                        singleList.put(trackObj);

                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("type", "video");
                        ret.put("tracks", singleList);
                        call.resolve(ret);
                        return;
                    }
                }

                call.reject("Could not find any playlist or video from the provided link");

            } catch (Exception e) {
                call.reject("Failed to import playlist: " + e.getMessage(), e);
            }
        }).start();
    }

    private void extractTracksFromBrowseJson(Object obj, JSArray results) {
        if (obj instanceof JSONObject) {
            JSONObject json = (JSONObject) obj;
            if (json.has("musicResponsiveListItemRenderer")) {
                try {
                    JSONObject item = json.getJSONObject("musicResponsiveListItemRenderer");
                    String vid = null;
                    if (item.has("playlistItemData")) {
                        vid = item.optJSONObject("playlistItemData").optString("videoId", null);
                    }
                    if (vid == null && item.has("doubleTapCommand")) {
                        vid = item.optJSONObject("doubleTapCommand")
                                .optJSONObject("watchEndpoint")
                                .optString("videoId", null);
                    }
                    if (vid == null && item.has("navigationEndpoint")) {
                        vid = item.optJSONObject("navigationEndpoint")
                                .optJSONObject("watchEndpoint")
                                .optString("videoId", null);
                    }
                    if (vid == null && item.has("overlay")) {
                        try {
                            vid = item.optJSONObject("overlay")
                                    .optJSONObject("musicItemThumbnailOverlayRenderer")
                                    .optJSONObject("content")
                                    .optJSONObject("musicPlayButtonRenderer")
                                    .optJSONObject("playNavigationEndpoint")
                                    .optJSONObject("watchEndpoint")
                                    .optString("videoId", null);
                        } catch (Exception ignored) {}
                    }

                    JSONArray flex = item.optJSONArray("flexColumns");
                    String title = "";
                    String artist = "Unknown Artist";
                    if (flex != null && flex.length() > 0) {
                        JSONArray titleRuns = flex.optJSONObject(0)
                                .optJSONObject("musicResponsiveListItemFlexColumnRenderer")
                                .optJSONObject("text")
                                .optJSONArray("runs");
                        if (titleRuns != null && titleRuns.length() > 0) {
                            title = titleRuns.optJSONObject(0).optString("text", "");
                        }
                    }
                    if (flex != null && flex.length() > 1) {
                        JSONArray artistRuns = flex.optJSONObject(1)
                                .optJSONObject("musicResponsiveListItemFlexColumnRenderer")
                                .optJSONObject("text")
                                .optJSONArray("runs");
                        if (artistRuns != null && artistRuns.length() > 0) {
                            artist = artistRuns.optJSONObject(0).optString("text", "Unknown Artist");
                        }
                    }

                    if (vid == null && flex != null) {
                        for (int f = 0; f < flex.length(); f++) {
                            JSONObject col = flex.optJSONObject(f);
                            if (col != null && col.has("musicResponsiveListItemFlexColumnRenderer")) {
                                JSONObject textObj = col.optJSONObject("musicResponsiveListItemFlexColumnRenderer").optJSONObject("text");
                                if (textObj != null && textObj.has("runs")) {
                                    JSONArray runs = textObj.optJSONArray("runs");
                                    if (runs != null) {
                                        for (int r = 0; r < runs.length(); r++) {
                                            JSONObject runObj = runs.optJSONObject(r);
                                            if (runObj != null && runObj.has("navigationEndpoint")) {
                                                JSONObject ep = runObj.optJSONObject("navigationEndpoint");
                                                if (ep != null && ep.has("watchEndpoint")) {
                                                    String epVid = ep.optJSONObject("watchEndpoint").optString("videoId", null);
                                                    if (epVid != null && !epVid.isEmpty()) {
                                                        vid = epVid;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (vid != null) break;
                        }
                    }

                    String duration = "03:30";
                    JSONArray fixed = item.optJSONArray("fixedColumns");
                    if (fixed != null && fixed.length() > 0) {
                        JSONArray durRuns = fixed.optJSONObject(0)
                                .optJSONObject("musicResponsiveListItemFixedColumnRenderer")
                                .optJSONObject("text")
                                .optJSONArray("runs");
                        if (durRuns != null && durRuns.length() > 0) {
                            duration = durRuns.optJSONObject(0).optString("text", "03:30");
                        }
                    }

                    String thumbnail = "https://i.ytimg.com/vi/" + vid + "/hqdefault.jpg";
                    JSONObject thumbObj = item.optJSONObject("thumbnail");
                    if (thumbObj != null) {
                        JSONArray thumbs = thumbObj.optJSONObject("musicThumbnailRenderer")
                                .optJSONObject("thumbnail")
                                .optJSONArray("thumbnails");
                        if (thumbs != null && thumbs.length() > 0) {
                            thumbnail = thumbs.optJSONObject(thumbs.length() - 1).optString("url", thumbnail);
                        }
                    }

                    if (vid != null && !vid.isEmpty() && !title.isEmpty()) {
                        JSObject t = new JSObject();
                        t.put("videoId", vid);
                        t.put("title", title);
                        t.put("artist", artist);
                        t.put("duration", duration);
                        t.put("thumbnail", thumbnail);
                        results.put(t);
                    }
                } catch (Exception ignored) {}
            } else {
                for (java.util.Iterator<String> it = json.keys(); it.hasNext(); ) {
                    String k = it.next();
                    Object val = json.opt(k);
                    if (val != null) {
                        extractTracksFromBrowseJson(val, results);
                    }
                }
            }
        } else if (obj instanceof JSONArray) {
            JSONArray arr = (JSONArray) obj;
            for (int i = 0; i < arr.length(); i++) {
                Object item = arr.opt(i);
                if (item != null) {
                    extractTracksFromBrowseJson(item, results);
                }
            }
        }
    }

    @PluginMethod
    public void openExternalUrl(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.trim().isEmpty()) {
            call.reject("URL is required");
            return;
        }

        try {
            Uri uri = Uri.parse(url.trim());
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            // Specifically target Google Chrome first so it opens in Chrome
            try {
                intent.setPackage("com.android.chrome");
                getContext().startActivity(intent);
                call.resolve();
                return;
            } catch (Exception chromeMissing) {
                // If Chrome is not installed, fallback to the default web browser
                intent.setPackage(null);
            }

            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to launch external browser: " + e.getMessage());
        }
    }
}

