package com.pixelbeats.music.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.pixelbeats.music.data.model.EqualizerBand
import com.pixelbeats.music.data.model.EqualizerPreset
import com.pixelbeats.music.data.model.Track
import com.pixelbeats.music.data.network.ArchiveApiService
import com.pixelbeats.music.data.network.UpdateInfo
import com.pixelbeats.music.data.network.UpdateManager
import com.pixelbeats.music.data.repository.MusicRepository
import com.pixelbeats.music.data.repository.PreferencesManager
import com.pixelbeats.music.playback.AudioEffectsManager
import com.pixelbeats.music.playback.MusicController
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val apiService = ArchiveApiService()
    private val prefs = PreferencesManager(application)
    val repository = MusicRepository(apiService, prefs)
    val musicController = MusicController(application)
    private val updateManager = UpdateManager(application)
    private val effectsManager = AudioEffectsManager()

    val currentTrack = musicController.currentTrack
    val isPlaying = musicController.isPlaying
    val playbackPosition = musicController.playbackPosition
    val duration = musicController.duration
    val isShuffleEnabled = musicController.isShuffleEnabled
    val repeatMode = musicController.repeatMode
    val queue = musicController.queue

    // Navigation and Sheets
    private val _currentTab = MutableStateFlow(0) // 0: Search/Home, 1: Library, 2: Settings
    val currentTab: StateFlow<Int> = _currentTab.asStateFlow()

    private val _isPlayerExpanded = MutableStateFlow(false)
    val isPlayerExpanded: StateFlow<Boolean> = _isPlayerExpanded.asStateFlow()

    private val _isEqualizerOpen = MutableStateFlow(false)
    val isEqualizerOpen: StateFlow<Boolean> = _isEqualizerOpen.asStateFlow()

    // Search & Curated State
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    val categories = listOf("All", "Lofi", "Rock", "Jazz", "Blues", "Classical")
    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _searchResults = MutableStateFlow<List<Track>>(emptyList())
    val searchResults: StateFlow<List<Track>> = _searchResults.asStateFlow()

    private val _isSearching = MutableStateFlow(false)
    val isSearching: StateFlow<Boolean> = _isSearching.asStateFlow()

    // Library State
    private val _favorites = MutableStateFlow<List<Track>>(emptyList())
    val favorites: StateFlow<List<Track>> = _favorites.asStateFlow()

    private val _recentTracks = MutableStateFlow<List<Track>>(emptyList())
    val recentTracks: StateFlow<List<Track>> = _recentTracks.asStateFlow()

    // Equalizer State
    private val _equalizerBands = MutableStateFlow<List<EqualizerBand>>(emptyList())
    val equalizerBands: StateFlow<List<EqualizerBand>> = _equalizerBands.asStateFlow()

    val equalizerPresets = effectsManager.defaultPresets

    private val _selectedPreset = MutableStateFlow(prefs.getEqualizerPreset())
    val selectedPreset: StateFlow<String> = _selectedPreset.asStateFlow()

    private val _isBassBoost = MutableStateFlow(prefs.isBassBoostEnabled())
    val isBassBoost: StateFlow<Boolean> = _isBassBoost.asStateFlow()

    // Update State
    private val _updateInfo = MutableStateFlow<UpdateInfo?>(null)
    val updateInfo: StateFlow<UpdateInfo?> = _updateInfo.asStateFlow()

    private val _isCheckingUpdate = MutableStateFlow(false)
    val isCheckingUpdate: StateFlow<Boolean> = _isCheckingUpdate.asStateFlow()

    private val _downloadProgress = MutableStateFlow<Int?>(null)
    val downloadProgress: StateFlow<Int?> = _downloadProgress.asStateFlow()

    init {
        musicController.connect()
        refreshLibrary()
        initEqualizer()
        loadCategoryTracks("All")
    }

    fun setTab(index: Int) {
        _currentTab.value = index
    }

    fun setPlayerExpanded(expanded: Boolean) {
        _isPlayerExpanded.value = expanded
    }

    fun setEqualizerOpen(open: Boolean) {
        _isEqualizerOpen.value = open
    }

    fun onQueryChange(q: String) {
        _searchQuery.value = q
    }

    fun search(q: String) {
        if (q.isBlank()) {
            loadCategoryTracks(_selectedCategory.value)
            return
        }
        viewModelScope.launch {
            _isSearching.value = true
            val res = repository.searchTracks(q)
            _searchResults.value = res
            _isSearching.value = false
        }
    }

    fun selectCategory(cat: String) {
        _selectedCategory.value = cat
        loadCategoryTracks(cat)
    }

    private fun loadCategoryTracks(cat: String) {
        viewModelScope.launch {
            _isSearching.value = true
            val tracks = repository.getCuratedTracks(cat)
            _searchResults.value = tracks
            _isSearching.value = false
        }
    }

    fun playTrack(track: Track, newQueue: List<Track>? = null) {
        viewModelScope.launch {
            // Resolve direct audio stream if not yet resolved
            val resolved = repository.resolveTrackStream(track)
            musicController.playTrack(resolved, newQueue ?: _searchResults.value)
            repository.addRecentTrack(resolved)
            refreshLibrary()
        }
    }

    fun togglePlayPause() = musicController.togglePlayPause()
    fun seekTo(ms: Long) = musicController.seekTo(ms)
    fun skipNext() = musicController.skipNext()
    fun skipPrevious() = musicController.skipPrevious()
    fun toggleShuffle() = musicController.toggleShuffle()
    fun toggleRepeat() = musicController.toggleRepeat()

    fun toggleFavorite(track: Track) {
        repository.toggleFavorite(track)
        refreshLibrary()
    }

    fun isFavorite(trackId: String): Boolean {
        return repository.isFavorite(trackId)
    }

    private fun refreshLibrary() {
        _favorites.value = repository.getFavorites()
        _recentTracks.value = repository.getRecentTracks()
    }

    private fun initEqualizer() {
        _equalizerBands.value = effectsManager.getBands()
    }

    fun setBandLevel(bandIndex: Int, level: Int) {
        effectsManager.setBandLevel(bandIndex, level)
        val current = _equalizerBands.value.toMutableList()
        if (bandIndex in 0 until current.size) {
            current[bandIndex] = current[bandIndex].copy(level = level)
            _equalizerBands.value = current
            repository.saveEqualizerLevels(current.map { it.level })
            _selectedPreset.value = "Custom"
            repository.saveEqualizerPreset("Custom")
        }
    }

    fun selectPreset(preset: EqualizerPreset) {
        effectsManager.applyPreset(preset)
        _selectedPreset.value = preset.name
        repository.saveEqualizerPreset(preset.name)
        val current = _equalizerBands.value.toMutableList()
        for (i in 0 until minOf(current.size, preset.levels.size)) {
            current[i] = current[i].copy(level = preset.levels[i])
        }
        _equalizerBands.value = current
        repository.saveEqualizerLevels(preset.levels)
    }

    fun toggleBassBoost(enabled: Boolean) {
        _isBassBoost.value = enabled
        effectsManager.setBassBoost(enabled)
        repository.setBassBoostEnabled(enabled)
    }

    fun checkForUpdate(currentVer: String = "2.0.0") {
        viewModelScope.launch {
            _isCheckingUpdate.value = true
            val info = updateManager.checkUpdate(currentVer)
            _updateInfo.value = info
            _isCheckingUpdate.value = false
        }
    }

    fun downloadAndInstallUpdate() {
        val url = _updateInfo.value?.downloadUrl ?: return
        viewModelScope.launch {
            _downloadProgress.value = 0
            updateManager.downloadAndInstall(
                downloadUrl = url,
                onProgress = { p -> _downloadProgress.value = p },
                onError = { _downloadProgress.value = null }
            )
        }
    }

    override fun onCleared() {
        super.onCleared()
        musicController.release()
    }
}

