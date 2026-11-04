package com.pixelbeats.music.data.network

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream

data class UpdateInfo(
    val hasUpdate: Boolean,
    val latestVersion: String,
    val title: String,
    val notes: String,
    val downloadUrl: String,
    val apkSize: Long
)

class UpdateManager(private val context: Context) {

    private val client = OkHttpClient()

    suspend fun checkUpdate(currentVersion: String): UpdateInfo = withContext(Dispatchers.IO) {
        try {
            val url = "https://api.github.com/repos/prajoy-ux/PixelBeats/releases/latest"
            val req = Request.Builder()
                .url(url)
                .header("Accept", "application/vnd.github.v3+json")
                .header("User-Agent", "PixelBeats-Android/2.0")
                .build()

            val resp = client.newCall(req).execute()
            if (!resp.isSuccessful) {
                return@withContext UpdateInfo(false, currentVersion, "", "", "", 0L)
            }

            val body = resp.body?.string() ?: return@withContext UpdateInfo(false, currentVersion, "", "", "", 0L)
            val json = JSONObject(body)
            val remoteTag = json.optString("tag_name", "").removePrefix("v")
            val title = json.optString("name", "New Update")
            val notes = json.optString("body", "")

            var downloadUrl = ""
            var apkSize = 0L
            val assets = json.optJSONArray("assets")
            if (assets != null) {
                for (i in 0 until assets.length()) {
                    val asset = assets.optJSONObject(i) ?: continue
                    val name = asset.optString("name", "")
                    if (name.endsWith(".apk", ignoreCase = true)) {
                        downloadUrl = asset.optString("browser_download_url", "")
                        apkSize = asset.optLong("size", 0L)
                        break
                    }
                }
            }

            val isNewer = isVersionNewer(remoteTag, currentVersion)
            UpdateInfo(isNewer, remoteTag, title, notes, downloadUrl, apkSize)
        } catch (e: Exception) {
            e.printStackTrace()
            UpdateInfo(false, currentVersion, "", "", "", 0L)
        }
    }

    suspend fun downloadAndInstall(
        downloadUrl: String,
        onProgress: (Int) -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.IO) {
        try {
            val req = Request.Builder().url(downloadUrl).build()
            val resp = client.newCall(req).execute()
            if (!resp.isSuccessful) {
                withContext(Dispatchers.Main) { onError("Download failed (HTTP ${resp.code})") }
                return@withContext
            }

            val body = resp.body ?: run {
                withContext(Dispatchers.Main) { onError("Empty download body") }
                return@withContext
            }

            val totalBytes = body.contentLength()
            val apkFile = File(context.cacheDir, "PixelBeats_update.apk")
            if (apkFile.exists()) apkFile.delete()

            body.byteStream().use { input ->
                FileOutputStream(apkFile).use { output ->
                    val buffer = ByteArray(8192)
                    var read: Int
                    var totalRead = 0L

                    while (input.read(buffer).also { read = it } != -1) {
                        output.write(buffer, 0, read)
                        totalRead += read
                        if (totalBytes > 0) {
                            val progress = ((totalRead * 100) / totalBytes).toInt()
                            withContext(Dispatchers.Main) { onProgress(progress) }
                        }
                    }
                    output.flush()
                }
            }

            // Launch package installer
            withContext(Dispatchers.Main) {
                launchInstaller(apkFile)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            withContext(Dispatchers.Main) { onError("Update error: ${e.message}") }
        }
    }

    private fun launchInstaller(apkFile: File) {
        try {
            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
                putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true)
                putExtra(Intent.EXTRA_INSTALLER_PACKAGE_NAME, context.packageName)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.packageManager.canRequestPackageInstalls()) {
                    val permIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${context.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(permIntent)
                    return
                }
            }

            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun isVersionNewer(remote: String, current: String): Boolean {
        val rParts = remote.split(".").mapNotNull { it.toIntOrNull() }
        val cParts = current.split(".").mapNotNull { it.toIntOrNull() }
        val maxLen = maxOf(rParts.size, cParts.size)

        for (i in 0 until maxLen) {
            val r = rParts.getOrElse(i) { 0 }
            val c = cParts.getOrElse(i) { 0 }
            if (r > c) return true
            if (r < c) return false
        }
        return false
    }
}

