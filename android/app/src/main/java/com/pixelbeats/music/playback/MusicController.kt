package com.pixelbeats.music.playback

import android.content.ComponentName
import android.content.Context
import android.net.Uri
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import com.pixelbeats.music.data.model.Track
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MusicController(private val context: Context) {

    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var mediaController: MediaController? = null

    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private var progressJob: Job? = null

    private val _currentTrack = MutableStateFlow<Track?>(null)
    val currentTrack: StateFlow<Track?> = _currentTrack.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _playbackPosition = MutableStateFlow(0L)
    val playbackPosition: StateFlow<Long> = _playbackPosition.asStateFlow()

    private val _duration = MutableStateFlow(0L)
    val duration: StateFlow<Long> = _duration.asStateFlow()

    private val _queue = MutableStateFlow<List<Track>>(emptyList())
    val queue: StateFlow<List<Track>> = _queue.asStateFlow()

    private val _currentIndex = MutableStateFlow(-1)
    val currentIndex: StateFlow<Int> = _currentIndex.asStateFlow()

    private val _isShuffleEnabled = MutableStateFlow(false)
    val isShuffleEnabled: StateFlow<Boolean> = _isShuffleEnabled.asStateFlow()

    private val _repeatMode = MutableStateFlow(Player.REPEAT_MODE_OFF)
    val repeatMode: StateFlow<Int> = _repeatMode.asStateFlow()

    fun connect(onConnected: (() -> Unit)? = null) {
        val sessionToken = SessionToken(context, ComponentName(context, PlaybackService::class.java))
        controllerFuture = MediaController.Builder(context, sessionToken).buildAsync()
        controllerFuture?.addListener({
            mediaController = controllerFuture?.get()
            setupPlayerListener()
            onConnected?.invoke()
        }, MoreExecutors.directExecutor())
    }

    private fun setupPlayerListener() {
        val player = mediaController ?: return
        player.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(playing: Boolean) {
                _isPlaying.value = playing
                if (playing) startProgressTracking() else stopProgressTracking()
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY) {
                    _duration.value = player.duration.coerceAtLeast(0L)
                } else if (playbackState == Player.STATE_ENDED) {
                    skipNext()
                }
            }

            override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                val track = mediaItem?.localConfiguration?.tag as? Track
                if (track != null) {
                    _currentTrack.value = track
                    _duration.value = track.duration
                }
            }

            override fun onShuffleModeEnabledChanged(shuffleModeEnabled: Boolean) {
                _isShuffleEnabled.value = shuffleModeEnabled
            }

            override fun onRepeatModeChanged(repeat: Int) {
                _repeatMode.value = repeat
            }
        })
    }

    @OptIn(UnstableApi::class)
    fun playTrack(track: Track, newQueue: List<Track>? = null) {
        val player = mediaController ?: return

        if (newQueue != null && newQueue.isNotEmpty()) {
            _queue.value = newQueue
            _currentIndex.value = newQueue.indexOfFirst { it.id == track.id }.coerceAtLeast(0)
        } else if (!_queue.value.any { it.id == track.id }) {
            _queue.value = _queue.value + track
            _currentIndex.value = _queue.value.size - 1
        } else {
            _currentIndex.value = _queue.value.indexOfFirst { it.id == track.id }
        }

        _currentTrack.value = track
        _duration.value = track.duration

        val metadata = MediaMetadata.Builder()
            .setTitle(track.title)
            .setArtist(track.artist)
            .setAlbumTitle(track.album)
            .setArtworkUri(if (track.coverUrl.isNotEmpty()) Uri.parse(track.coverUrl) else null)
            .build()

        val mediaItem = MediaItem.Builder()
            .setUri(track.streamUrl)
            .setMediaMetadata(metadata)
            .setTag(track)
            .build()

        player.setMediaItem(mediaItem)
        player.prepare()
        player.play()
    }

    fun togglePlayPause() {
        val player = mediaController ?: return
        if (player.isPlaying) {
            player.pause()
        } else {
            player.play()
        }
    }

    fun seekTo(positionMs: Long) {
        mediaController?.seekTo(positionMs)
        _playbackPosition.value = positionMs
    }

    fun skipNext() {
        val q = _queue.value
        if (q.isEmpty()) return
        val nextIdx = if (_isShuffleEnabled.value) {
            (0 until q.size).random()
        } else {
            (_currentIndex.value + 1) % q.size
        }
        _currentIndex.value = nextIdx
        playTrack(q[nextIdx])
    }

    fun skipPrevious() {
        val q = _queue.value
        if (q.isEmpty()) return
        val prevIdx = if (_currentIndex.value > 0) _currentIndex.value - 1 else q.size - 1
        _currentIndex.value = prevIdx
        playTrack(q[prevIdx])
    }

    fun toggleShuffle() {
        val player = mediaController ?: return
        val newShuffle = !_isShuffleEnabled.value
        player.shuffleModeEnabled = newShuffle
        _isShuffleEnabled.value = newShuffle
    }

    fun toggleRepeat() {
        val player = mediaController ?: return
        val nextRepeat = when (_repeatMode.value) {
            Player.REPEAT_MODE_OFF -> Player.REPEAT_MODE_ALL
            Player.REPEAT_MODE_ALL -> Player.REPEAT_MODE_ONE
            else -> Player.REPEAT_MODE_OFF
        }
        player.repeatMode = nextRepeat
        _repeatMode.value = nextRepeat
    }

    private fun startProgressTracking() {
        progressJob?.cancel()
        progressJob = scope.launch {
            while (isActive) {
                mediaController?.let {
                    _playbackPosition.value = it.currentPosition.coerceAtLeast(0L)
                }
                delay(300)
            }
        }
    }

    private fun stopProgressTracking() {
        progressJob?.cancel()
    }

    fun release() {
        stopProgressTracking()
        controllerFuture?.let { MediaController.releaseFuture(it) }
        mediaController = null
    }
}

