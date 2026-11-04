package com.pixelbeats.music

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LibraryMusic
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import com.pixelbeats.music.ui.MainViewModel
import com.pixelbeats.music.ui.components.EqualizerSheet
import com.pixelbeats.music.ui.components.MiniPlayer
import com.pixelbeats.music.ui.screens.LibraryScreen
import com.pixelbeats.music.ui.screens.PlayerScreen
import com.pixelbeats.music.ui.screens.SearchScreen
import com.pixelbeats.music.ui.screens.SettingsScreen
import com.pixelbeats.music.ui.theme.PixelBeatsTheme

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        setContent {
            PixelBeatsTheme(darkTheme = true, dynamicColor = true) {
                val currentTab by viewModel.currentTab.collectAsState()
                val isPlayerExpanded by viewModel.isPlayerExpanded.collectAsState()
                val isEqualizerOpen by viewModel.isEqualizerOpen.collectAsState()

                val currentTrack by viewModel.currentTrack.collectAsState()
                val isPlaying by viewModel.isPlaying.collectAsState()
                val positionMs by viewModel.playbackPosition.collectAsState()
                val durationMs by viewModel.duration.collectAsState()
                val isShuffle by viewModel.isShuffleEnabled.collectAsState()
                val repeatMode by viewModel.repeatMode.collectAsState()

                val searchQuery by viewModel.searchQuery.collectAsState()
                val categories = viewModel.categories
                val selectedCategory by viewModel.selectedCategory.collectAsState()
                val searchResults by viewModel.searchResults.collectAsState()
                val isSearching by viewModel.isSearching.collectAsState()

                val favorites by viewModel.favorites.collectAsState()
                val recentTracks by viewModel.recentTracks.collectAsState()

                val equalizerBands by viewModel.equalizerBands.collectAsState()
                val equalizerPresets = viewModel.equalizerPresets
                val selectedPreset by viewModel.selectedPreset.collectAsState()
                val isBassBoost by viewModel.isBassBoost.collectAsState()

                val updateInfo by viewModel.updateInfo.collectAsState()
                val isCheckingUpdate by viewModel.isCheckingUpdate.collectAsState()
                val downloadProgress by viewModel.downloadProgress.collectAsState()

                Box(modifier = Modifier.fillMaxSize()) {
                    Scaffold(
                        bottomBar = {
                            Column {
                                // Floating Mini Player
                                AnimatedVisibility(
                                    visible = currentTrack != null && !isPlayerExpanded,
                                    enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
                                    exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
                                ) {
                                    MiniPlayer(
                                        track = currentTrack,
                                        isPlaying = isPlaying,
                                        positionMs = positionMs,
                                        durationMs = durationMs,
                                        onPlayPauseClick = { viewModel.togglePlayPause() },
                                        onSkipNextClick = { viewModel.skipNext() },
                                        onClick = { viewModel.setPlayerExpanded(true) }
                                    )
                                }

                                // Pixel Material 3 Navigation Bar
                                NavigationBar(
                                    containerColor = MaterialTheme.colorScheme.surface,
                                    tonalElevation = 4.dp
                                ) {
                                    NavigationBarItem(
                                        selected = currentTab == 0,
                                        onClick = { viewModel.setTab(0) },
                                        icon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                                        label = { Text("Search") }
                                    )
                                    NavigationBarItem(
                                        selected = currentTab == 1,
                                        onClick = { viewModel.setTab(1) },
                                        icon = { Icon(Icons.Default.LibraryMusic, contentDescription = "Library") },
                                        label = { Text("Library") }
                                    )
                                    NavigationBarItem(
                                        selected = currentTab == 2,
                                        onClick = { viewModel.setTab(2) },
                                        icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                        label = { Text("Settings") }
                                    )
                                }
                            }
                        }
                    ) { innerPadding ->
                        Box(modifier = Modifier.padding(innerPadding)) {
                            when (currentTab) {
                                0 -> SearchScreen(
                                    query = searchQuery,
                                    onQueryChange = { viewModel.onQueryChange(it) },
                                    onSearch = { viewModel.search(it) },
                                    categories = categories,
                                    selectedCategory = selectedCategory,
                                    onCategorySelect = { viewModel.selectCategory(it) },
                                    results = searchResults,
                                    isLoading = isSearching,
                                    currentTrack = currentTrack,
                                    onTrackSelect = { viewModel.playTrack(it) },
                                    onFavoriteToggle = { viewModel.toggleFavorite(it) },
                                    isFavorite = { viewModel.isFavorite(it) }
                                )
                                1 -> LibraryScreen(
                                    favorites = favorites,
                                    recentTracks = recentTracks,
                                    currentTrack = currentTrack,
                                    onTrackSelect = { viewModel.playTrack(it) },
                                    onFavoriteToggle = { viewModel.toggleFavorite(it) },
                                    isFavorite = { viewModel.isFavorite(it) }
                                )
                                2 -> SettingsScreen(
                                    currentVersion = "2.0.0",
                                    updateInfo = updateInfo,
                                    isCheckingUpdate = isCheckingUpdate,
                                    downloadProgress = downloadProgress,
                                    onCheckUpdate = { viewModel.checkForUpdate("2.0.0") },
                                    onInstallUpdate = { viewModel.downloadAndInstallUpdate() }
                                )
                            }
                        }
                    }

                    // Full Screen Player
                    AnimatedVisibility(
                        visible = isPlayerExpanded,
                        enter = slideInVertically(initialOffsetY = { it }),
                        exit = slideOutVertically(targetOffsetY = { it })
                    ) {
                        PlayerScreen(
                            track = currentTrack,
                            isPlaying = isPlaying,
                            positionMs = positionMs,
                            durationMs = durationMs,
                            isShuffleEnabled = isShuffle,
                            repeatMode = repeatMode,
                            isFavorite = currentTrack?.let { viewModel.isFavorite(it.id) } ?: false,
                            onPlayPause = { viewModel.togglePlayPause() },
                            onSkipNext = { viewModel.skipNext() },
                            onSkipPrevious = { viewModel.skipPrevious() },
                            onSeekTo = { viewModel.seekTo(it) },
                            onToggleShuffle = { viewModel.toggleShuffle() },
                            onToggleRepeat = { viewModel.toggleRepeat() },
                            onToggleFavorite = { currentTrack?.let { viewModel.toggleFavorite(it) } },
                            onOpenEqualizer = { viewModel.setEqualizerOpen(true) },
                            onOpenQueue = { /* Queue bottom sheet */ },
                            onMinimize = { viewModel.setPlayerExpanded(false) }
                        )
                    }

                    // Equalizer Bottom Sheet
                    if (isEqualizerOpen) {
                        EqualizerSheet(
                            bands = equalizerBands,
                            presets = equalizerPresets,
                            selectedPreset = selectedPreset,
                            bassBoostEnabled = isBassBoost,
                            onBandChange = { idx, lvl -> viewModel.setBandLevel(idx, lvl) },
                            onPresetSelect = { viewModel.selectPreset(it) },
                            onBassBoostToggle = { viewModel.toggleBassBoost(it) },
                            onDismiss = { viewModel.setEqualizerOpen(false) }
                        )
                    }
                }
            }
        }
    }
}

