/**
 * PIXELMUSIC // GOOGLE PIXEL "MATERIAL YOU" (MATERIAL DESIGN 3) AUDIO ENGINE
 * Authentic Android Monet Dynamic Theming, Bento Widgets, & Offline Vault
 * Full-stack client for Web and native Capacitor Android.
 */

// ================= GLOBAL STATE =================
// ================= ARCHIVETUNE NATIVE STANDALONE BRIDGE =================
// Enables 100% independent execution on Android/Web without needing any PC server or Wi-Fi pairing!
const ArchiveTuneBridge = {
  isNative() {
    return !!(typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ArchiveTune);
  },
  async resolveStream(videoId) {
    if (this.isNative()) {
      try {
        return await window.Capacitor.Plugins.ArchiveTune.resolveStream({ videoId });
      } catch (e) {
        console.warn('[ArchiveTune Native] Stream resolve notice:', e);
      }
    }
    return null;
  },
  async search(query) {
    if (this.isNative()) {
      try {
        const res = await window.Capacitor.Plugins.ArchiveTune.search({ query });
        return res && res.tracks ? res.tracks : [];
      } catch (e) {
        console.warn('[ArchiveTune Native] Search notice:', e);
      }
    }
    return null;
  },
  async getNextQueue(videoId) {
    if (this.isNative()) {
      try {
        const res = await window.Capacitor.Plugins.ArchiveTune.getNextQueue({ videoId });
        return res && res.tracks ? res.tracks : [];
      } catch (e) {
        console.warn('[ArchiveTune Native] Next queue notice:', e);
      }
    }
    return null;
  },
  async getLyrics(videoId, title, artist, durationSec) {
    if (this.isNative()) {
      try {
        return await window.Capacitor.Plugins.ArchiveTune.getLyrics({
          videoId,
          title: title || '',
          artist: artist || '',
          duration: durationSec || 0
        });
      } catch (e) {
        console.warn('[ArchiveTune Native] Lyrics notice:', e);
      }
    }
    return null;
  },
  async setEqualizerPreset(preset) {
    if (this.isNative()) {
      try {
        return await window.Capacitor.Plugins.ArchiveTune.setEqualizerPreset({ preset });
      } catch (e) {
        console.warn('[ArchiveTune Native] EQ preset notice:', e);
      }
    }
    return null;
  },
  async updateMediaSession(details) {
    if (this.isNative()) {
      try {
        return await window.Capacitor.Plugins.ArchiveTune.updateMediaSession(details);
      } catch (e) {
        console.warn('[ArchiveTune Native] updateMediaSession error:', e);
      }
    }
    return null;
  },
  async updatePlaybackState(details) {
    if (this.isNative()) {
      try {
        return await window.Capacitor.Plugins.ArchiveTune.updatePlaybackState(details);
      } catch (e) {
        console.warn('[ArchiveTune Native] updatePlaybackState error:', e);
      }
    }
    return null;
  },
  async hideMediaNotification() {
    if (this.isNative()) {
      try {
        return await window.Capacitor.Plugins.ArchiveTune.hideMediaNotification();
      } catch (e) {}
    }
    return null;
  }
};

const BACKEND_CANDIDATES = [
  localStorage.getItem('pixelbeats_backend_url')
].filter(Boolean);

// Instant Seed Catalog: Guarantees 0ms cold-start render on phone startup
const SEED_TRENDING_TRACKS = [
  {
    videoId: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "03:20",
    thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg"
  },
  {
    videoId: "kJQP7kiw5Fk",
    title: "Despacito",
    artist: "Luis Fonsi ft. Daddy Yankee",
    album: "VIDA",
    duration: "04:42",
    thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg"
  },
  {
    videoId: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: "03:53",
    thumbnail: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg"
  },
  {
    videoId: "L3wKzyIN1yk",
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    album: "Brahmastra",
    duration: "04:28",
    thumbnail: "https://i.ytimg.com/vi/L3wKzyIN1yk/hqdefault.jpg"
  },
  {
    videoId: "hY7m5jjJ9mM",
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    album: "Starboy",
    duration: "03:50",
    thumbnail: "https://i.ytimg.com/vi/hY7m5jjJ9mM/hqdefault.jpg"
  },
  {
    videoId: "OPf0YbXqDm0",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    album: "Uptown Special",
    duration: "04:30",
    thumbnail: "https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg"
  },
  {
    videoId: "09R8_2nJtjg",
    title: "Sugar",
    artist: "Maroon 5",
    album: "V",
    duration: "03:55",
    thumbnail: "https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg"
  },
  {
    videoId: "hT_nvWreIhg",
    title: "Counting Stars",
    artist: "OneRepublic",
    album: "Native",
    duration: "04:17",
    thumbnail: "https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg"
  },
  {
    videoId: "fJ9rUzIMcZQ",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: "05:55",
    thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"
  },
  {
    videoId: "2Vv-BfVoq4g",
    title: "Perfect",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: "04:23",
    thumbnail: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg"
  },
  {
    videoId: "ru0K8uYEZWw",
    title: "Can't Feel My Face",
    artist: "The Weeknd",
    album: "Beauty Behind the Madness",
    duration: "03:35",
    thumbnail: "https://i.ytimg.com/vi/ru0K8uYEZWw/hqdefault.jpg"
  },
  {
    videoId: "RgKAFK5djSk",
    title: "See You Again",
    artist: "Wiz Khalifa ft. Charlie Puth",
    album: "Furious 7",
    duration: "03:49",
    thumbnail: "https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg"
  }
];

// High-speed, verified public mirrors for autonomous fallback
const FALLBACK_STREAM_INSTANCES = [
  'https://invidious.f5.si',
  'https://invidious.projectsegfau.lt',
  'https://pipedapi.in.projectsegfau.lt'
];
let currentFallbackIndex = 0;

function getFallbackBaseUrl() {
  return FALLBACK_STREAM_INSTANCES[currentFallbackIndex % FALLBACK_STREAM_INSTANCES.length];
}

function rotateFallbackInstance() {
  currentFallbackIndex = (currentFallbackIndex + 1) % FALLBACK_STREAM_INSTANCES.length;
}

const STATE = {
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
  backendUrl: localStorage.getItem('pixelbeats_backend_url') || '',
  isStandalone: true,
  autoFallback: true,
  sfxEnabled: localStorage.getItem('pixelbeats_sfx') !== 'false',
  isAutoCycle: localStorage.getItem('pixelbeats_auto_cycle') !== 'false',
  prefetchedStreams: new Map(), // videoId -> stream_url
  inFlightStreamPromises: new Map(), // videoId -> Promise<stream_url>
  lyricsCache: new Map(), // videoId -> Array<{ time: number, text: string }>
  inFlightLyricsPromises: new Map(), // videoId -> Promise<Array>
  isBackendAlive: false,
  activeTab: 'tab-player',
  searchMode: 'songs', // 'songs' | 'albums'
  activeLibView: 'offline', // 'offline' | 'playlists' | 'albums'
  currentViewingAlbum: null,
  currentViewingPlaylistId: null,
  pendingPickerTrack: null,
  lyricsMode: false,
  currentLyrics: [],
  activeLyricIndex: -1,
  lyricsLoadedForSongId: null,
  lastSearchResults: [],
  trendingTracks: [],
  searchResults: [],
  currentVolume: parseFloat(localStorage.getItem('pixelbeats_volume') || '0.75'),
  eqPreset: localStorage.getItem('pixelbeats_eq') || 'flat',
  sleepTimerMode: '0'
};

// ================= DOM ELEMENTS =================
const elements = {
  audio: document.getElementById('audio-player'),
  playerCoverArt: document.getElementById('player-cover-art'),
  artLoading: document.getElementById('art-loading'),
  trackTitle: document.getElementById('track-title'),
  trackArtist: document.getElementById('track-artist'),
  timeCurrent: document.getElementById('time-current'),
  timeDuration: document.getElementById('time-duration'),
  seekSlider: document.getElementById('seek-slider'),
  scrubberContainer: document.getElementById('scrubber-container'),
  scrubberTrack: document.getElementById('scrubber-track'),
  scrubberFill: document.getElementById('scrubber-fill'),
  scrubberThumb: document.getElementById('scrubber-thumb'),
  scrubberEmpty: document.getElementById('scrubber-empty'),
  prefetchIndicator: document.getElementById('prefetch-indicator'),
  sourceIndicator: document.getElementById('source-indicator'),
  statusPill: document.getElementById('status-pill'),
  statusLabel: document.getElementById('status-label'),
  btnThemeSwitcher: document.getElementById('btn-theme-switcher'),
  monetCanvas: document.getElementById('monet-canvas'),

  // Expressive Material 3 Elements
  albumArtWrapper: document.getElementById('album-art-wrapper'),
  ambientBassGlow: document.getElementById('ambient-bass-glow'),
  coverFloatingBadge: document.getElementById('cover-floating-badge'),
  lyricsContainer: document.getElementById('lyrics-container'),
  btnCloseLyrics: document.getElementById('btn-close-lyrics'),
  lyricsStatus: document.getElementById('lyrics-status'),
  lyricsStatusText: document.getElementById('lyrics-status-text'),
  lyricsScrollList: document.getElementById('lyrics-scroll-list'),
  floatingMiniPlayer: document.getElementById('floating-mini-player'),
  miniThumb: document.getElementById('mini-thumb'),
  miniTitle: document.getElementById('mini-title'),
  miniArtist: document.getElementById('mini-artist'),
  miniBtnPlay: document.getElementById('mini-btn-play'),
  miniPlayIcon: document.getElementById('mini-play-icon'),
  miniBtnNext: document.getElementById('mini-btn-next'),

  // Controls
  btnPlay: document.getElementById('btn-play'),
  playIcon: document.getElementById('play-icon'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  btnShuffle: document.getElementById('btn-shuffle'),
  btnRepeat: document.getElementById('btn-repeat'),
  btnDownloadTrack: document.getElementById('btn-download-track'),
  downloadBtnLabel: document.getElementById('download-btn-label'),
  btnPlayerAddPlaylist: document.getElementById('btn-player-add-playlist'),
  btnAutoCycle: document.getElementById('btn-auto-cycle'),
  autoCycleLabel: document.getElementById('auto-cycle-label'),
  pixelVolPill: document.getElementById('pixel-vol-pill'),
  volMuteBtn: document.getElementById('vol-mute-btn'),
  volModeIcon: document.getElementById('vol-mode-icon'),
  volTrackArea: document.getElementById('vol-track-area'),
  volFillBar: document.getElementById('vol-fill-bar'),
  volDivider: document.getElementById('vol-divider'),
  volEmptyBar: document.getElementById('vol-empty-bar'),
  volLyricsBtn: document.getElementById('vol-lyrics-btn'),
  volEqBtn: document.getElementById('vol-eq-btn'),
  pixelVolumeShell: document.getElementById('pixel-vol-pill') || document.getElementById('pixel-volume-shell'),
  volCircleBtn: document.getElementById('vol-mute-btn') || document.getElementById('vol-circle-btn'),
  volCircleIcon: document.getElementById('vol-mode-icon') || document.getElementById('vol-circle-icon'),
  volSplitTrack: document.getElementById('vol-track-area') || document.getElementById('vol-split-track'),
  volFillOlive: document.getElementById('vol-fill-bar') || document.getElementById('vol-fill-olive'),
  volHandleLine: document.getElementById('vol-divider') || document.getElementById('vol-handle-line'),
  volEmptyCream: document.getElementById('vol-empty-bar') || document.getElementById('vol-empty-cream'),
  volSlider: document.getElementById('vol-slider'),
  volSquareBtn: document.getElementById('vol-lyrics-btn') || document.getElementById('vol-square-btn'),
  volLyricsIcon: document.getElementById('vol-lyrics-btn')?.querySelector('.material-symbols-rounded') || document.getElementById('vol-lyrics-icon'),

  // Search
  btnSearchModeSongs: document.getElementById('search-mode-songs'),
  btnSearchModeAlbums: document.getElementById('search-mode-albums'),
  searchInput: document.getElementById('search-input'),
  btnSearchClear: document.getElementById('btn-search-clear'),
  btnSearch: document.getElementById('btn-search'),
  playlistInput: document.getElementById('playlist-input'),
  btnImportPlaylist: document.getElementById('btn-import-playlist'),
  searchResults: document.getElementById('search-results'),
  searchSpinner: document.getElementById('search-spinner'),

  // Library
  libNavOffline: document.getElementById('lib-nav-offline'),
  libNavPlaylists: document.getElementById('lib-nav-playlists'),
  libNavAlbums: document.getElementById('lib-nav-albums'),
  libViewOffline: document.getElementById('lib-view-offline'),
  libViewPlaylists: document.getElementById('lib-view-playlists'),
  libViewAlbums: document.getElementById('lib-view-albums'),
  vaultStorageInfo: document.getElementById('vault-storage-info'),
  vaultList: document.getElementById('vault-list'),
  btnVaultPlayAll: document.getElementById('btn-vault-play-all'),
  vaultBadgeCount: document.getElementById('vault-badge-count'),
  playlistsGrid: document.getElementById('playlists-grid'),
  btnCreatePlaylist: document.getElementById('btn-create-playlist'),
  libAlbumsGrid: document.getElementById('lib-albums-grid'),

  // Queue
  queueList: document.getElementById('queue-list'),
  queueCount: document.getElementById('queue-count'),
  queueBadgeCount: document.getElementById('queue-badge-count'),
  btnClearQueue: document.getElementById('btn-clear-queue'),

  // Settings
  settingBackendUrl: document.getElementById('setting-backend-url'),
  btnTestBackend: document.getElementById('btn-test-backend'),
  backendTestResult: document.getElementById('backend-test-result'),
  backendTestStatus: document.getElementById('backend-test-status'),
  settingAutoFallback: document.getElementById('setting-auto-fallback'),
  settingSfx: document.getElementById('setting-sfx'),
  capStatus: document.getElementById('cap-status'),

  // Toast
  retroToast: document.getElementById('retro-toast'),
  toastIcon: document.getElementById('toast-icon'),
  toastMessage: document.getElementById('toast-message'),

  // Modals
  modalAlbum: document.getElementById('modal-album'),
  btnCloseAlbumModal: document.getElementById('btn-close-album-modal'),
  modalAlbumArt: document.getElementById('modal-album-art'),
  modalAlbumTitle: document.getElementById('modal-album-title'),
  modalAlbumArtist: document.getElementById('modal-album-artist'),
  modalAlbumMeta: document.getElementById('modal-album-meta'),
  btnModalAlbumPlay: document.getElementById('btn-modal-album-play'),
  btnModalAlbumQueue: document.getElementById('btn-modal-album-queue'),
  modalAlbumTracks: document.getElementById('modal-album-tracks'),

  modalPlaylist: document.getElementById('modal-playlist'),
  btnClosePlaylistModal: document.getElementById('btn-close-playlist-modal'),
  modalPlaylistName: document.getElementById('modal-playlist-name'),
  btnModalPlaylistPlay: document.getElementById('btn-modal-playlist-play'),
  btnModalPlaylistShuffle: document.getElementById('btn-modal-playlist-shuffle'),
  btnModalPlaylistDelete: document.getElementById('btn-modal-playlist-delete'),
  modalPlaylistTracks: document.getElementById('modal-playlist-tracks'),

  modalPlaylistPicker: document.getElementById('modal-playlist-picker'),
  btnClosePickerModal: document.getElementById('btn-close-picker-modal'),
  pickerTrackLabel: document.getElementById('picker-track-label'),
  btnPickerCreateNew: document.getElementById('btn-picker-create-new'),
  pickerPlaylistsList: document.getElementById('picker-playlists-list')
};

// ================= MATERIAL FLOATING TOAST =================
let toastTimer = null;
function showToast(message, icon = 'graphic_eq', duration = 2200) {
  if (!elements.retroToast) return;
  elements.toastMessage.textContent = message;
  if (elements.toastIcon) elements.toastIcon.textContent = icon;
  elements.retroToast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.retroToast.classList.add('hidden');
  }, duration);
}

// ================= MONET DYNAMIC THEME ENGINE =================
const THEMES = ['matcha', 'olive', 'terracotta', 'lavender', 'monet'];
const THEME_NAMES = {
  matcha: 'Botanical Matcha & Olive',
  olive: 'Olive & Moss',
  terracotta: 'Sand & Terracotta',
  lavender: 'Lavender & Rose',
  monet: 'Dynamic Monet (Auto)'
};

// ================= HIGH-CONTRAST SLIDER STYLE ENFORCER =================
function enforceSliderStyles() {
  // 0. Main App Shell Background (#363D17 Original Deep Earth)
  const shell = document.querySelector('.pixel-shell');
  const playerTab = document.getElementById('tab-player');
  if (playerTab) {
    playerTab.style.setProperty('background', 'transparent', 'important');
    playerTab.style.setProperty('background-color', 'transparent', 'important');
  }
  if (shell) {
    shell.style.setProperty('background', '#363D17', 'important');
    shell.style.setProperty('background-color', '#363D17', 'important');
  }

  // Hero Player Card (100% Soft Sage #C8D394 Floating Card)
  const heroCard = document.getElementById('hero-card') || document.querySelector('.hero-media-card') || document.querySelector('.player-card');
  if (heroCard) {
    heroCard.style.setProperty('background', '#C8D394', 'important');
    heroCard.style.setProperty('background-color', '#C8D394', 'important');
    heroCard.style.setProperty('border', 'none', 'important');
    heroCard.style.setProperty('border-radius', '28px', 'important');
    heroCard.style.setProperty('color', '#363D17', 'important');
  }

  // Hero Card Foreground Elements
  if (elements.trackTitle) {
    elements.trackTitle.style.setProperty('color', '#363D17', 'important');
  }
  if (elements.trackArtist) {
    elements.trackArtist.style.setProperty('color', '#576028', 'important');
  }
  if (elements.timeCurrent) {
    elements.timeCurrent.style.setProperty('color', '#576028', 'important');
  }
  if (elements.timeDuration) {
    elements.timeDuration.style.setProperty('color', '#576028', 'important');
  }
  const losslessBadge = document.getElementById('lossless-badge');
  if (losslessBadge) {
    losslessBadge.style.setProperty('background', 'transparent', 'important');
    losslessBadge.style.setProperty('background-color', 'transparent', 'important');
    losslessBadge.style.setProperty('border', 'none', 'important');
    losslessBadge.style.setProperty('box-shadow', 'none', 'important');
    losslessBadge.style.setProperty('color', '#141A02', 'important');
    const svg = losslessBadge.querySelector('.lossless-icon-svg');
    if (svg) {
      svg.style.setProperty('fill', '#141A02', 'important');
      svg.style.setProperty('color', '#141A02', 'important');
      const p = svg.querySelector('path');
      if (p) p.style.setProperty('fill', '#141A02', 'important');
    }
    const txt = losslessBadge.querySelector('.lossless-text');
    if (txt) txt.style.setProperty('color', '#141A02', 'important');
  }
  if (elements.btnPlay) {
    elements.btnPlay.style.setProperty('background', '#576028', 'important');
    elements.btnPlay.style.setProperty('background-color', '#576028', 'important');
    elements.btnPlay.style.setProperty('color', '#EFF2E1', 'important');
  }
  if (elements.playIcon) {
    elements.playIcon.style.setProperty('color', '#EFF2E1', 'important');
  }
  if (elements.btnPrev) {
    elements.btnPrev.style.setProperty('background', '#EFF2E1', 'important');
    elements.btnPrev.style.setProperty('background-color', '#EFF2E1', 'important');
    elements.btnPrev.style.setProperty('color', '#363D17', 'important');
    const pIcon = elements.btnPrev.querySelector('.material-symbols-rounded');
    if (pIcon) pIcon.style.setProperty('color', '#363D17', 'important');
  }
  if (elements.btnNext) {
    elements.btnNext.style.setProperty('background', '#EFF2E1', 'important');
    elements.btnNext.style.setProperty('background-color', '#EFF2E1', 'important');
    elements.btnNext.style.setProperty('color', '#363D17', 'important');
    const nIcon = elements.btnNext.querySelector('.material-symbols-rounded');
    if (nIcon) nIcon.style.setProperty('color', '#363D17', 'important');
  }
  // Shuffle & Repeat buttons inside hero card
  const shuffleBtn = elements.btnShuffle || document.getElementById('btn-shuffle');
  const repeatBtn = elements.btnRepeat || document.getElementById('btn-repeat');
  [shuffleBtn, repeatBtn].forEach(btn => {
    if (!btn) return;
    btn.style.setProperty('border-radius', '50%', 'important');
    btn.style.setProperty('opacity', '1', 'important');
    btn.style.setProperty('border', 'none', 'important');
    const icon = btn.querySelector('.material-symbols-rounded');
    if (btn.classList.contains('active')) {
      btn.style.setProperty('background', '#576028', 'important');
      btn.style.setProperty('background-color', '#576028', 'important');
      btn.style.setProperty('color', '#EFF2E1', 'important');
      if (icon) {
        icon.style.setProperty('color', '#EFF2E1', 'important');
        icon.style.setProperty('opacity', '1', 'important');
      }
    } else {
      btn.style.setProperty('background', 'rgba(54, 61, 23, 0.1)', 'important');
      btn.style.setProperty('background-color', 'rgba(54, 61, 23, 0.1)', 'important');
      btn.style.setProperty('color', '#363D17', 'important');
      if (icon) {
        icon.style.setProperty('color', '#363D17', 'important');
        icon.style.setProperty('opacity', '1', 'important');
      }
    }
  });

  // 1. Music Progress Scrubber (Inside Soft Sage #C8D394 Player Card)
  const scrubberFill = document.getElementById('scrubber-fill') || document.querySelector('.scrubber-fill-olive');
  const scrubberThumb = document.getElementById('scrubber-thumb') || document.querySelector('.scrubber-handle-line');
  const scrubberEmpty = document.getElementById('scrubber-empty') || document.querySelector('.scrubber-empty-cream');

  if (scrubberFill) {
    scrubberFill.style.setProperty('background', '#576028', 'important');
    scrubberFill.style.setProperty('background-color', '#576028', 'important');
    scrubberFill.style.setProperty('border', 'none', 'important');
    scrubberFill.style.setProperty('outline', 'none', 'important');
    scrubberFill.style.setProperty('min-width', '0px', 'important');
    const curW = parseFloat(scrubberFill.style.width) || 0;
    if (curW <= 1.5) {
      scrubberFill.style.setProperty('width', '0px', 'important');
      scrubberFill.style.setProperty('display', 'none', 'important');
    } else {
      scrubberFill.style.setProperty('display', 'block', 'important');
      scrubberFill.style.setProperty('border-radius', '99px 3px 3px 99px', 'important');
    }
  }
  if (scrubberThumb) {
    scrubberThumb.style.setProperty('background', '#363D17', 'important');
    scrubberThumb.style.setProperty('background-color', '#363D17', 'important');
    scrubberThumb.style.setProperty('width', '4px', 'important');
    scrubberThumb.style.setProperty('height', '24px', 'important');
    scrubberThumb.style.setProperty('border-radius', '99px', 'important');
    scrubberThumb.style.setProperty('margin', '0 4px', 'important');
    scrubberThumb.style.setProperty('box-shadow', 'none', 'important');
  }
  if (scrubberEmpty) {
    scrubberEmpty.style.setProperty('background', '#EFF2E1', 'important');
    scrubberEmpty.style.setProperty('background-color', '#EFF2E1', 'important');
    scrubberEmpty.style.setProperty('border-radius', '3px 99px 99px 3px', 'important');
  }

  // 2. Google Pixel Material 3 Split-Track Volume Pill
  const volPill = document.getElementById('pixel-vol-pill') || document.querySelector('.pixel-vol-pill') || document.querySelector('.pixel-volume-shell');
  const volMuteBtn = document.getElementById('vol-mute-btn') || document.querySelector('.pixel-vol-mute') || document.querySelector('.vol-circle-btn');
  const volFillBar = document.getElementById('vol-fill-bar') || document.querySelector('.pixel-vol-fill') || document.querySelector('.vol-fill-olive');
  const volDivider = document.getElementById('vol-divider') || document.querySelector('.pixel-vol-divider') || document.querySelector('.vol-handle-line');
  const volEmptyBar = document.getElementById('vol-empty-bar') || document.querySelector('.pixel-vol-empty') || document.querySelector('.vol-empty-cream');
  const volCaptionBtn = document.getElementById('vol-lyrics-btn') || document.querySelector('.pixel-vol-caption') || document.querySelector('.vol-square-btn');
  const volEqBtn = document.getElementById('vol-eq-btn') || document.querySelector('.pixel-vol-eq');

  if (volPill) {
    volPill.style.setProperty('background', '#C8D394', 'important');
    volPill.style.setProperty('background-color', '#C8D394', 'important');
    volPill.style.setProperty('border', 'none', 'important');
    volPill.style.setProperty('border-radius', '999px', 'important');
    volPill.style.setProperty('height', '58px', 'important');
    volPill.style.setProperty('padding', '6px 10px 6px 6px', 'important');
  }
  if (volMuteBtn) {
    volMuteBtn.style.setProperty('width', '42px', 'important');
    volMuteBtn.style.setProperty('height', '42px', 'important');
    volMuteBtn.style.setProperty('min-width', '42px', 'important');
    volMuteBtn.style.setProperty('border-radius', '50%', 'important');
    volMuteBtn.style.setProperty('background', '#576028', 'important');
    volMuteBtn.style.setProperty('background-color', '#576028', 'important');
    volMuteBtn.style.setProperty('color', '#EFF2E1', 'important');
    volMuteBtn.style.setProperty('border', 'none', 'important');
    const muteIcon = volMuteBtn.querySelector('.material-symbols-rounded');
    if (muteIcon) muteIcon.style.setProperty('color', '#EFF2E1', 'important');
  }
  if (volFillBar) {
    volFillBar.style.setProperty('background', '#576028', 'important');
    volFillBar.style.setProperty('background-color', '#576028', 'important');
    volFillBar.style.setProperty('height', '40px', 'important');
    volFillBar.style.setProperty('border-radius', '16px 4px 4px 16px', 'important');
  }
  if (volDivider) {
    volDivider.style.setProperty('background', '#363D17', 'important');
    volDivider.style.setProperty('background-color', '#363D17', 'important');
    volDivider.style.setProperty('width', '4px', 'important');
    volDivider.style.setProperty('height', '44px', 'important');
    volDivider.style.setProperty('border-radius', '99px', 'important');
    volDivider.style.setProperty('margin', '0 3px', 'important');
  }
  if (volEmptyBar) {
    volEmptyBar.style.setProperty('background', '#EFF2E1', 'important');
    volEmptyBar.style.setProperty('background-color', '#EFF2E1', 'important');
    volEmptyBar.style.setProperty('height', '40px', 'important');
    volEmptyBar.style.setProperty('padding', '0', 'important');
    volEmptyBar.style.setProperty('min-width', '0px', 'important');
    volEmptyBar.style.setProperty('overflow', 'hidden', 'important');
    const noteIcon = volEmptyBar.querySelector('.material-symbols-rounded, span');
    if (noteIcon) noteIcon.remove();
  }
  if (volCaptionBtn) {
    volCaptionBtn.style.setProperty('width', '38px', 'important');
    volCaptionBtn.style.setProperty('height', '38px', 'important');
    volCaptionBtn.style.setProperty('min-width', '38px', 'important');
    volCaptionBtn.style.setProperty('border-radius', '12px', 'important');
    volCaptionBtn.style.setProperty('background', '#EFF2E1', 'important');
    volCaptionBtn.style.setProperty('background-color', '#EFF2E1', 'important');
    volCaptionBtn.style.setProperty('color', '#363D17', 'important');
    volCaptionBtn.style.setProperty('border', 'none', 'important');
    const capIcon = volCaptionBtn.querySelector('.material-symbols-rounded');
    if (capIcon) capIcon.style.setProperty('color', '#363D17', 'important');
  }
  if (volEqBtn) {
    volEqBtn.style.setProperty('background', 'transparent', 'important');
    volEqBtn.style.setProperty('background-color', 'transparent', 'important');
    volEqBtn.style.setProperty('color', '#363D17', 'important');
    volEqBtn.style.setProperty('border', 'none', 'important');
    const eqIcon = volEqBtn.querySelector('.material-symbols-rounded');
    if (eqIcon) eqIcon.style.setProperty('color', '#363D17', 'important');
  }

  // 3. Bento Action Buttons (Soft Sage normal, Deep Olive active)
  document.querySelectorAll('.bento-widget-btn').forEach(btn => {
    btn.style.setProperty('border', 'none', 'important');
    btn.style.setProperty('border-radius', '20px', 'important');
    btn.style.setProperty('height', '52px', 'important');
    btn.style.setProperty('opacity', '1', 'important');
    const isActive = btn.classList.contains('active');
    if (isActive) {
      btn.style.setProperty('background', '#576028', 'important');
      btn.style.setProperty('background-color', '#576028', 'important');
      btn.style.setProperty('color', '#EFF2E1', 'important');
      btn.querySelectorAll('span, .material-symbols-rounded, .btn-icon-m3, .btn-text').forEach(el => {
        el.style.setProperty('color', '#EFF2E1', 'important');
      });
    } else {
      btn.style.setProperty('background', '#C8D394', 'important');
      btn.style.setProperty('background-color', '#C8D394', 'important');
      btn.style.setProperty('color', '#363D17', 'important');
      btn.querySelectorAll('span, .material-symbols-rounded, .btn-icon-m3, .btn-text').forEach(el => {
        el.style.setProperty('color', '#363D17', 'important');
      });
    }
  });

  // 4. Material 3 Floating Bottom Navigation Bar (Soft Sage #C8D394 with Spring Pill)
  const bottomNav = document.querySelector('.m3-bottom-nav');
  if (bottomNav) {
    bottomNav.style.setProperty('height', '66px', 'important');
    bottomNav.style.setProperty('min-height', '66px', 'important');
    bottomNav.style.setProperty('background', '#C8D394', 'important');
    bottomNav.style.setProperty('background-color', '#C8D394', 'important');
    bottomNav.style.setProperty('border', 'none', 'important');
    bottomNav.style.setProperty('margin', '0 auto 12px auto', 'important');
    bottomNav.style.setProperty('width', 'calc(100% - 32px)', 'important');
    bottomNav.style.setProperty('padding', '0', 'important');
    bottomNav.style.setProperty('border-radius', '999px', 'important');
    bottomNav.style.setProperty('position', 'relative', 'important');
    bottomNav.style.setProperty('overflow', 'hidden', 'important');
    bottomNav.style.setProperty('display', 'flex', 'important');
    bottomNav.style.setProperty('align-items', 'center', 'important');
    bottomNav.style.setProperty('justify-content', 'stretch', 'important');
  }
  const navIndicator = document.getElementById('nav-indicator-pill');
  if (navIndicator) {
    navIndicator.style.setProperty('display', 'block', 'important');
    navIndicator.style.setProperty('background', '#576028', 'important');
    navIndicator.style.setProperty('background-color', '#576028', 'important');
    navIndicator.style.setProperty('border-radius', '999px', 'important');
    navIndicator.style.setProperty('box-shadow', '0 3px 10px rgba(54, 61, 23, 0.28)', 'important');
  }
  document.querySelectorAll('.m3-nav-item').forEach(btn => {
    btn.style.setProperty('display', 'flex', 'important');
    btn.style.setProperty('align-items', 'center', 'important');
    btn.style.setProperty('justify-content', 'center', 'important');
    btn.style.setProperty('text-align', 'center', 'important');
    btn.style.setProperty('margin', '0', 'important');
    btn.style.setProperty('padding', '0', 'important');
    btn.style.setProperty('left', 'auto', 'important');
    btn.style.setProperty('right', 'auto', 'important');
    btn.style.setProperty('transform', 'none', 'important');
    btn.style.setProperty('background', 'transparent', 'important');
    btn.style.setProperty('background-color', 'transparent', 'important');
    btn.style.setProperty('box-shadow', 'none', 'important');
    btn.style.setProperty('outline', 'none', 'important');
    btn.style.setProperty('border', 'none', 'important');
    btn.style.setProperty('-webkit-tap-highlight-color', 'transparent', 'important');

    const pill = btn.querySelector('.m3-nav-pill');
    const label = btn.querySelector('.m3-nav-label');
    const icon = pill ? pill.querySelector('.material-symbols-rounded') : null;
    if (pill) {
      pill.style.setProperty('display', 'flex', 'important');
      pill.style.setProperty('flex-direction', 'column', 'important');
      pill.style.setProperty('align-items', 'center', 'important');
      pill.style.setProperty('justify-content', 'center', 'important');
      pill.style.setProperty('text-align', 'center', 'important');
      pill.style.setProperty('margin', '0 auto', 'important');
      pill.style.setProperty('width', '100%', 'important');
      pill.style.setProperty('max-width', '76px', 'important');
      pill.style.setProperty('min-width', '58px', 'important');
      pill.style.setProperty('height', '54px', 'important');
      pill.style.setProperty('padding', '4px 8px', 'important');
      pill.style.setProperty('box-sizing', 'border-box', 'important');
      pill.style.setProperty('border-radius', '999px', 'important');
      pill.style.setProperty('left', 'auto', 'important');
      pill.style.setProperty('right', 'auto', 'important');
      pill.style.setProperty('background', 'transparent', 'important');
      pill.style.setProperty('background-color', 'transparent', 'important');
      pill.style.setProperty('box-shadow', 'none', 'important');
      pill.style.setProperty('transition', 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease, width 0.3s ease', 'important');
    }
    if (btn.classList.contains('active')) {
      if (icon) {
        icon.style.setProperty('color', '#EFF2E1', 'important');
        icon.style.setProperty('opacity', '1', 'important');
        icon.style.setProperty('transform', 'scale(1.05) translate(0, 0)', 'important');
        icon.style.setProperty('transform-origin', 'center center', 'important');
        icon.style.setProperty('margin', '0 auto', 'important');
        icon.style.setProperty('margin-left', '0', 'important');
        icon.style.setProperty('margin-right', '0', 'important');
        icon.style.setProperty('padding', '0', 'important');
        icon.style.setProperty('padding-left', '0', 'important');
        icon.style.setProperty('padding-right', '0', 'important');
        icon.style.setProperty('text-align', 'center', 'important');
      }
      if (label) {
        label.style.setProperty('color', '#EFF2E1', 'important');
        label.style.setProperty('font-weight', '700', 'important');
        label.style.setProperty('opacity', '1', 'important');
        label.style.setProperty('display', 'block', 'important');
        label.style.setProperty('width', '100%', 'important');
        label.style.setProperty('text-align', 'center', 'important');
        label.style.setProperty('margin', '0 auto', 'important');
        label.style.setProperty('margin-left', '0', 'important');
        label.style.setProperty('margin-right', '0', 'important');
        label.style.setProperty('padding', '0', 'important');
        label.style.setProperty('padding-left', '0', 'important');
        label.style.setProperty('padding-right', '0', 'important');
        label.style.setProperty('transform', 'none', 'important');
      }
    } else {
      if (icon) {
        icon.style.setProperty('color', '#363D17', 'important');
        icon.style.setProperty('opacity', '0.75', 'important');
        icon.style.setProperty('transform', 'scale(1) translate(0, 0)', 'important');
        icon.style.setProperty('transform-origin', 'center center', 'important');
        icon.style.setProperty('margin', '0 auto', 'important');
        icon.style.setProperty('margin-left', '0', 'important');
        icon.style.setProperty('margin-right', '0', 'important');
        icon.style.setProperty('padding', '0', 'important');
        icon.style.setProperty('padding-left', '0', 'important');
        icon.style.setProperty('padding-right', '0', 'important');
        icon.style.setProperty('text-align', 'center', 'important');
      }
      if (label) {
        label.style.setProperty('color', '#363D17', 'important');
        label.style.setProperty('font-weight', '600', 'important');
        label.style.setProperty('opacity', '0.75', 'important');
        label.style.setProperty('display', 'block', 'important');
        label.style.setProperty('width', '100%', 'important');
        label.style.setProperty('text-align', 'center', 'important');
        label.style.setProperty('margin', '0 auto', 'important');
        label.style.setProperty('margin-left', '0', 'important');
        label.style.setProperty('margin-right', '0', 'important');
        label.style.setProperty('padding', '0', 'important');
        label.style.setProperty('padding-left', '0', 'important');
        label.style.setProperty('padding-right', '0', 'important');
        label.style.setProperty('transform', 'none', 'important');
      }
    }
  });
}

// ================= APPLE MUSIC-STYLE SPRING PILL POSITIONER =================
function positionNavIndicator(animate = true) {
  const nav = document.querySelector('.m3-bottom-nav');
  const indicator = document.getElementById('nav-indicator-pill');
  const activeBtn = document.querySelector('.m3-nav-item.active');
  if (!nav || !indicator || !activeBtn) return;

  const pill = activeBtn.querySelector('.m3-nav-pill') || activeBtn;
  const navRect = nav.getBoundingClientRect();
  const btnRect = activeBtn.getBoundingClientRect();
  const pillRect = pill.getBoundingClientRect();

  if (navRect.width === 0 || pillRect.width === 0) {
    requestAnimationFrame(() => positionNavIndicator(false));
    return;
  }

  const targetWidth = Math.round(pillRect.width);
  const targetHeight = Math.round(pillRect.height);

  // Center the indicator over the button's midpoint (not the pill's left edge)
  const btnCenterX = btnRect.left + btnRect.width / 2 - navRect.left;
  const targetX = Math.round(btnCenterX - targetWidth / 2);
  const targetY = Math.round(pillRect.top - navRect.top);

  // Clamp within safe bounds
  const safeX = Math.max(6, Math.min(targetX, Math.round(navRect.width - targetWidth - 6)));

  indicator.style.setProperty('width', `${targetWidth}px`, 'important');
  indicator.style.setProperty('height', `${targetHeight}px`, 'important');
  indicator.style.setProperty('display', 'block', 'important');

  if (!animate) {
    indicator.style.setProperty('transition', 'none', 'important');
    indicator.style.setProperty('transform', `translate3d(${safeX}px, ${targetY}px, 0)`, 'important');
    indicator.offsetHeight; // force reflow
    indicator.style.setProperty('opacity', '1', 'important');
    return;
  }

  indicator.style.setProperty('opacity', '1', 'important');
  indicator.style.setProperty('transition', 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s ease', 'important');
  indicator.style.setProperty('transform', `translate3d(${safeX}px, ${targetY}px, 0)`, 'important');
}

function applyTheme(themeKey, notify = false) {
  STATE.currentTheme = 'matcha';
  localStorage.setItem('pixelbeats_theme', 'matcha');

  document.body.className = 'theme-matcha';

  // Always reset dynamic inline properties to allow high-contrast CSS tokens to take precedence
  document.documentElement.style.removeProperty('--bg-base');
  document.documentElement.style.removeProperty('--bg-surface');
  document.documentElement.style.removeProperty('--card-surface');
  document.documentElement.style.removeProperty('--card-accent');
  document.documentElement.style.removeProperty('--hero-bg');
  document.documentElement.style.removeProperty('--hero-text');
  document.documentElement.style.removeProperty('--hero-accent');
  document.documentElement.style.removeProperty('--primary-pill');
  document.documentElement.style.removeProperty('--primary-pill-text');
  document.documentElement.style.removeProperty('--nav-bg');
  document.documentElement.style.removeProperty('--nav-indicator');

  // Ensure high-contrast slider styles are strictly enforced
  enforceSliderStyles();
}

function cycleTheme() {
  // Theme locked to default Botanical Matcha
}

// Extract dominant Monet colors from current HD album art
function extractMonetPalette(imgEl) {
  // Theme locked to default Botanical Matcha
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }
  return [h, Math.round(s * 100), Math.round(l * 100)];
}

// ================= SUBTLE TONAL HAPTICS / SFX =================
let sfxAudioCtx = null;
function getAudioContext() {
  if (!sfxAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) sfxAudioCtx = new AudioContextClass();
  }
  if (sfxAudioCtx && sfxAudioCtx.state === 'suspended') {
    sfxAudioCtx.resume();
  }
  return sfxAudioCtx;
}

function playHapticSfx(type = 'click') {
  if (!STATE.sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.03);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'play') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (e) {}
}

// ================= MODERN PILL PROGRESS SCRUBBER =================
let isUserScrubbing = false;

function updateScrubberUI(cur, dur) {
  if (isUserScrubbing) return;
  const progressRatio = (dur > 0) ? Math.min(1, Math.max(0, cur / dur)) : 0;
  const percent = parseFloat((progressRatio * 100).toFixed(2));

  const scrubberFill = elements.scrubberFill || document.getElementById('scrubber-fill') || document.querySelector('.scrubber-fill-olive');
  if (scrubberFill) {
    if (percent <= 1.5) {
      scrubberFill.style.setProperty('width', '0px', 'important');
      scrubberFill.style.setProperty('display', 'none', 'important');
    } else {
      scrubberFill.style.setProperty('display', 'block', 'important');
      scrubberFill.style.setProperty('width', `${percent}%`, 'important');
      scrubberFill.style.setProperty('border-radius', '99px 3px 3px 99px', 'important');
    }
  }
  if (elements.seekSlider) {
    elements.seekSlider.value = percent;
  }
}

function initScrubberInteractions() {
  const container = elements.scrubberContainer;
  const slider = elements.seekSlider;
  if (!container || !slider) return;

  function updateVisualsFromVal(val) {
    const percent = Math.min(100, Math.max(0, parseFloat(val)));
    const scrubberFill = elements.scrubberFill || document.getElementById('scrubber-fill') || document.querySelector('.scrubber-fill-olive');
    if (scrubberFill) {
      if (percent <= 1.5) {
        scrubberFill.style.setProperty('width', '0px', 'important');
        scrubberFill.style.setProperty('display', 'none', 'important');
      } else {
        scrubberFill.style.setProperty('display', 'block', 'important');
        scrubberFill.style.setProperty('width', `${percent}%`, 'important');
        scrubberFill.style.setProperty('border-radius', '99px 3px 3px 99px', 'important');
      }
    }
    if (elements.audio && elements.audio.duration) {
      const targetTime = (percent / 100) * elements.audio.duration;
      if (elements.timeCurrent) {
        elements.timeCurrent.textContent = formatSecondsToTime(targetTime);
      }
    }
  }

  // Pointer / Touch tracking for interactive sliding & visual thickening
  const startDrag = () => {
    isUserScrubbing = true;
    container.classList.add('is-dragging');
  };

  const endDrag = () => {
    if (isUserScrubbing) {
      isUserScrubbing = false;
      container.classList.remove('is-dragging');
      if (elements.audio && elements.audio.duration) {
        const targetTime = (parseFloat(slider.value) / 100) * elements.audio.duration;
        elements.audio.currentTime = targetTime;
        updateMediaSessionPositionState();
        isUserScrollingLyrics = false;
        clearTimeout(userScrollTimer);
        syncLyricsWithTime(targetTime, true);
      }
    }
  };

  slider.addEventListener('pointerdown', startDrag);
  slider.addEventListener('touchstart', startDrag, { passive: true });
  slider.addEventListener('mousedown', startDrag);

  slider.addEventListener('input', () => {
    const val = parseFloat(slider.value);
    updateVisualsFromVal(val);
    if (elements.audio && elements.audio.duration) {
      const targetTime = (val / 100) * elements.audio.duration;
      syncLyricsWithTime(targetTime, false);
    }
  });

  slider.addEventListener('change', () => {
    endDrag();
  });

  // Direct pointer tracking on container with pointer capture
  const handlePointerTrack = (e) => {
    const rect = container.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left);
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    slider.value = ratio * 100;
    updateVisualsFromVal(ratio * 100);
  };

  container.addEventListener('pointerdown', (e) => {
    startDrag();
    try { container.setPointerCapture(e.pointerId); } catch (_) {}
    handlePointerTrack(e);
  });

  container.addEventListener('pointermove', (e) => {
    if (isUserScrubbing) {
      handlePointerTrack(e);
    }
  });

  const stopPointerDrag = (e) => {
    if (isUserScrubbing) {
      try { container.releasePointerCapture(e.pointerId); } catch (_) {}
      endDrag();
    }
  };

  container.addEventListener('pointerup', stopPointerDrag);
  container.addEventListener('pointercancel', stopPointerDrag);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);

  // Enforce high-contrast styles on scrubber elements
  enforceSliderStyles();
}

// Subtle Audio-Reactive Ambient Bass Glow Animation & 60fps Kinetic Lyrics Tracking
function renderAmbientGlow() {
  requestAnimationFrame(renderAmbientGlow);
  if (document.hidden) return; // Completely idle rendering while screen is off or in background
  const isAudioPlaying = STATE.isPlaying && elements.audio && !elements.audio.paused;
  if (elements.ambientBassGlow) {
    if (isAudioPlaying) {
      const time = elements.audio.currentTime || (Date.now() / 1000);
      const beatPulse = (Math.sin(time * 7.5) + 1) / 2;
      const bassScale = (0.96 + beatPulse * 0.12).toFixed(2);
      const bassOpacity = (0.45 + beatPulse * 0.35).toFixed(2);
      elements.ambientBassGlow.style.setProperty('--bass-scale', bassScale);
      elements.ambientBassGlow.style.setProperty('--bass-opacity', bassOpacity);
    } else {
      elements.ambientBassGlow.style.setProperty('--bass-opacity', '0');
    }
  }
  if (isAudioPlaying && STATE.lyricsMode) {
    syncLyricsWithTime(elements.audio.currentTime || 0);
  }
}

// ================= APPLE MUSIC-STYLE TIME-SYNCED LIVE LYRICS =================
function toggleLyricsMode() {
  STATE.lyricsMode = !STATE.lyricsMode;
  playHapticSfx('click');

  const volCaptionBtn = document.getElementById('vol-lyrics-btn') || elements.volSquareBtn;
  if (volCaptionBtn) {
    volCaptionBtn.classList.toggle('active', STATE.lyricsMode);
    const icon = volCaptionBtn.querySelector('.material-symbols-rounded') || elements.volLyricsIcon;
    if (icon) {
      icon.textContent = STATE.lyricsMode ? 'closed_caption_disabled' : 'closed_caption';
    }
  }
  if (elements.albumArtWrapper) {
    elements.albumArtWrapper.classList.toggle('lyrics-mode', STATE.lyricsMode);
  }
  if (elements.lyricsContainer) {
    elements.lyricsContainer.classList.toggle('hidden', !STATE.lyricsMode);
  }

  if (STATE.lyricsMode) {
    if (STATE.currentIndex >= 0 && STATE.currentIndex < STATE.queue.length) {
      const curSong = STATE.queue[STATE.currentIndex];
      if (curSong) {
        // Only render in-memory lyrics if they strictly belong to the current song
        if (STATE.lyricsLoadedForSongId === curSong.videoId && STATE.currentLyrics && STATE.currentLyrics.length > 0) {
          renderLyricsList();
          if (elements.lyricsStatus) elements.lyricsStatus.classList.add('hidden');
          syncLyricsWithTime(elements.audio ? (elements.audio.currentTime || 0) : 0);
        } else if (STATE.lyricsCache.has(curSong.videoId)) {
          const cached = STATE.lyricsCache.get(curSong.videoId);
          STATE.lyricsLoadedForSongId = curSong.videoId;
          STATE.currentLyrics = cached || [];
          if (cached && cached.length > 0) {
            renderLyricsList();
            if (elements.lyricsStatus) elements.lyricsStatus.classList.add('hidden');
            syncLyricsWithTime(elements.audio ? (elements.audio.currentTime || 0) : 0);
          } else {
            if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
            if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
            if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'No lyrics available for this track';
          }
        } else {
          fetchLyricsForCurrentTrack();
        }
      }
    } else {
      if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'Play a song to view live lyrics';
      if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
      if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
    }
  }
}

function normalizeTextForLyrics(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDurationToSeconds(durationStr) {
  if (!durationStr) return 0;
  if (typeof durationStr === 'number') return Math.round(durationStr);
  const parts = durationStr.toString().split(':').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

function cleanTitleForLyrics(title) {
  if (!title) return '';
  return title
    .replace(/\s*[\(\[](?:from\s+["']?[^"'\)\]]+["']?|official|music|video|audio|lyrics?|hd|4k|visualizer|remastered|lyric video|official video|official audio|full song|slowed|reverb|ost|soundtrack|prod\.?[^\)\]]*|te?aser|performance|live)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s*[\(\[](?:hindi|telugu|tamil|punjabi|malayalam|kannada|bhojpuri|bengali|marathi)[\)\]]/gi, '')
    .replace(/\s*f(ea)?t\.?.*$/i, '')
    .replace(/["'“”]/g, '')
    .trim();
}

function extractTrackAndArtistForLyrics(rawTitle, rawArtist) {
  let title = (rawTitle || '').trim();
  let artist = (rawArtist || '').trim();

  // Strip - Topic from auto-generated YouTube artist channels
  artist = artist.replace(/\s*-\s*topic$/i, '').trim();

  // Common record labels / channel brands that are not the actual artist
  const isLabel = /^(t-series|sony music|zee music|yrf|tips official|speed records|saregama|eros now|geet mp3|white hill|aditya music|lahari music|vevo|svf|yash raj films|shemaroo|tseries)/i.test(artist);
  if (isLabel) {
    artist = '';
  }

  // Remove bracketed noise: (Official Video), [4K], (Lyric Video), (From "..."), etc.
  let cleanTitle = title
    .replace(/\s*[\(\[](?:from\s+["']?[^"'\)\]]+["']?|official|music|video|audio|lyrics?|hd|4k|visualizer|remastered|lyric video|official video|official audio|full song|slowed|reverb|original|original audio|hq|live|performance|ost|soundtrack|prod\.?[^\)\]]*|te?aser)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s*[\(\[](?:hindi|telugu|tamil|punjabi|malayalam|kannada|bhojpuri|bengali|marathi)[\)\]]/gi, '')
    .trim();

  // Check for pipe separation: "Kesariya | Brahmastra | Ranbir | Alia | Pritam | Arijit"
  const pipeParts = cleanTitle.split('|').map(p => p.trim()).filter(Boolean);
  if (pipeParts.length > 1) {
    cleanTitle = pipeParts[0];
    if (!artist) {
      artist = pipeParts.slice(1).join(', ');
    }
  }

  // Check for "Artist - Title" or "Title - Artist"
  const hyphenParts = cleanTitle.split(/\s+-\s+/);
  if (hyphenParts.length === 2) {
    const p0 = hyphenParts[0].trim();
    const p1 = hyphenParts[1].trim();
    const normP0 = normalizeTextForLyrics(p0);
    const normP1 = normalizeTextForLyrics(p1);
    const normArt = normalizeTextForLyrics(artist);

    if (normArt && (normP0 === normArt || normP0.includes(normArt) || normArt.includes(normP0))) {
      cleanTitle = p1;
    } else if (normArt && (normP1 === normArt || normP1.includes(normArt) || normArt.includes(normP1))) {
      cleanTitle = p0;
    } else if (!artist) {
      artist = p0;
      cleanTitle = p1;
    } else {
      cleanTitle = p0;
    }
  }

  // Remove trailing "ft. / feat." from cleanTitle
  cleanTitle = cleanTitle.replace(/\s*f(ea)?t\.?.*$/i, '').trim();

  // Super clean (remove remaining parentheses and quotes)
  const superClean = cleanTitle.replace(/[\(\[][^()\[\]]*[\)\]]/g, '').replace(/["'“”]/g, '').trim();

  // Extract primary artist
  const primaryArtist = artist.split(/[,&•|/]|ft\.|feat\./i)[0].trim();

  return {
    rawTitle,
    rawArtist,
    cleanTitle: cleanTitle || title,
    superClean: superClean || cleanTitle || title,
    artist,
    primaryArtist
  };
}

function scoreCandidateForLyrics(candidate, targetInfo, targetDurationSec) {
  if (!candidate) return -100;
  if (!candidate.syncedLyrics && !candidate.plainLyrics && !candidate.instrumental) {
    return -100;
  }

  const candTrack = normalizeTextForLyrics(candidate.trackName);
  const candArtist = normalizeTextForLyrics(candidate.artistName);

  const targetTitleNorm = normalizeTextForLyrics(targetInfo.cleanTitle);
  const targetSuperNorm = normalizeTextForLyrics(targetInfo.superClean);
  const targetArtistNorm = normalizeTextForLyrics(targetInfo.artist);
  const targetPrimaryNorm = normalizeTextForLyrics(targetInfo.primaryArtist);
  const rawTitleNorm = normalizeTextForLyrics(targetInfo.rawTitle);

  // 1. TRACK NAME MATCH
  const exactSuper = (candTrack === targetSuperNorm);
  const exactClean = (candTrack === targetTitleNorm);
  const candContainsTarget = targetSuperNorm.length >= 3 && candTrack.includes(targetSuperNorm);
  const targetContainsCand = candTrack.length >= 3 && targetSuperNorm.includes(candTrack);

  if (!exactSuper && !exactClean && !candContainsTarget && !targetContainsCand) {
    return -100; // Complete mismatch in track title
  }

  let score = 0;
  if (exactSuper || exactClean) {
    score += 60;
  } else if (candContainsTarget || targetContainsCand) {
    score += 40;
  }

  // 2. ARTIST MATCH
  let artistMatched = false;
  if (targetPrimaryNorm && (candArtist === targetPrimaryNorm || candArtist.includes(targetPrimaryNorm) || targetPrimaryNorm.includes(candArtist))) {
    artistMatched = true;
    score += 40;
  } else if (targetArtistNorm && (candArtist.includes(targetArtistNorm) || targetArtistNorm.includes(candArtist))) {
    artistMatched = true;
    score += 35;
  } else if (candArtist.length >= 3 && rawTitleNorm.includes(candArtist)) {
    // Artist name from candidate is mentioned anywhere in YouTube title (e.g. Pritam, Arijit Singh)
    artistMatched = true;
    score += 35;
  }

  // If candidate artist does not match at all but target had an artist
  if (!artistMatched && targetPrimaryNorm) {
    score -= 15;
  }

  // 3. VARIANT & DURATION CHECKS
  const isVariantCandidate = /(refix|remix|acoustic|cover|slowed|reverb|live|mashup|sped up)/i.test(candidate.trackName || candidate.name || '');
  const isVariantTarget = /(refix|remix|acoustic|cover|slowed|reverb|live|mashup|sped up)/i.test(targetInfo.cleanTitle || targetInfo.superClean || '');
  if (isVariantCandidate && !isVariantTarget) {
    score -= 60; // Huge penalty for unwanted remix/refix version
  }

  if (targetDurationSec > 0 && candidate.duration > 0) {
    const diff = Math.abs(targetDurationSec - candidate.duration);
    if (diff <= 4) {
      score += 50; // near-perfect duration match
    } else if (diff <= 10) {
      score += 25;
    } else if (diff <= 25) {
      score += 5;
    } else if (diff > 35) {
      score -= 60; // large duration discrepancy: different version of song!
    }
  }

  // 4. SYNCED LYRICS BONUS
  if (candidate.syncedLyrics && candidate.syncedLyrics.trim().length > 0) {
    score += 30;
  }

  return score;
}

function parseLrcLyrics(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split(/\r?\n/);
  const result = [];
  const tagRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    tagRegex.lastIndex = 0;
    const timestamps = [];
    let match;
    let lastIndex = 0;
    while ((match = tagRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let millis = 0;
      if (match[3]) {
        const msStr = match[3];
        if (msStr.length === 1) millis = parseInt(msStr, 10) * 100;
        else if (msStr.length === 2) millis = parseInt(msStr, 10) * 10;
        else millis = parseInt(msStr.substring(0, 3), 10);
      }
      timestamps.push(minutes * 60 + seconds + (millis / 1000));
      lastIndex = tagRegex.lastIndex;
    }
    const text = trimmed.substring(lastIndex).trim();
    if (timestamps.length > 0 && text) {
      for (const time of timestamps) {
        result.push({ time, text });
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

function parsePlainLyrics(plainText) {
  if (!plainText) return [];
  return plainText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(text => ({ time: -1, text }));
}

async function fetchLyricsForSong(song) {
  if (!song || !song.videoId) return [];

  // 1. In-memory cache check (0ms)
  if (STATE.lyricsCache.has(song.videoId)) {
    return STATE.lyricsCache.get(song.videoId);
  }

  // 2. Persistent storage cache check (0ms)
  try {
    const diskRaw = localStorage.getItem('pixelbeats_lyrics_' + song.videoId);
    if (diskRaw) {
      const diskData = JSON.parse(diskRaw);
      if (Array.isArray(diskData)) {
        STATE.lyricsCache.set(song.videoId, diskData);
        return diskData;
      }
    }
  } catch (e) {}

  // 3. Deduplicate concurrent in-flight requests
  if (STATE.inFlightLyricsPromises.has(song.videoId)) {
    return STATE.inFlightLyricsPromises.get(song.videoId);
  }

  const promise = (async () => {
    const targetInfo = extractTrackAndArtistForLyrics(song.title, song.artist);
    const targetDurationSec = parseDurationToSeconds(song.duration);
    const fetchHeaders = { 'Accept': 'application/json' };

    // Helper to commit results to memory and persistent disk cache
    const commitLyrics = (lines) => {
      const result = Array.isArray(lines) ? lines : [];
      STATE.lyricsCache.set(song.videoId, result);
      try {
        if (result.length > 0) {
          localStorage.setItem('pixelbeats_lyrics_' + song.videoId, JSON.stringify(result));
        }
      } catch (e) {}
      return result;
    };

    // Parallel fetch tasks: launch all candidate sources simultaneously
    const tasks = [];

    // Task 1: ArchiveTune Native Android Plugin
    if (ArchiveTuneBridge.isNative()) {
      tasks.push(
        ArchiveTuneBridge.getLyrics(
          song.videoId,
          song.title,
          song.artist,
          targetDurationSec
        ).then(res => {
          if (res && Array.isArray(res.lines) && res.lines.length > 0) {
            const hasSynced = res.lines.some(l => l.time >= 0);
            return { lines: res.lines, isSynced: hasSynced, score: 99 };
          }
          return null;
        }).catch(() => null)
      );
    }

    // Task 2: Custom Backend (if alive and configured)
    if (STATE.backendUrl && STATE.isBackendAlive) {
      tasks.push((async () => {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2000);
          const backendLyricsUrl = `${STATE.backendUrl}/api/lyrics?id=${encodeURIComponent(song.videoId)}&title=${encodeURIComponent(song.title || '')}&artist=${encodeURIComponent(song.artist || '')}&duration=${encodeURIComponent(song.duration || '')}`;
          const bResp = await fetch(backendLyricsUrl, { signal: ctrl.signal });
          clearTimeout(timer);
          if (bResp.ok) {
            const bData = await bResp.json();
            if (bData && Array.isArray(bData.lines) && bData.lines.length > 0) {
              const hasSynced = bData.lines.some(l => l.time >= 0);
              return { lines: bData.lines, isSynced: hasSynced, score: 95 };
            }
          }
        } catch (e) {}
        return null;
      })());
    }

    // Task 3: Direct LRCLIB /api/get (exact track + primary artist, no duration lock)
    if (targetInfo.superClean && targetInfo.primaryArtist) {
      tasks.push((async () => {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2500);
          const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(targetInfo.superClean)}&artist_name=${encodeURIComponent(targetInfo.primaryArtist)}`;
          const resp = await fetch(url, { headers: fetchHeaders, signal: ctrl.signal });
          clearTimeout(timer);
          if (resp.ok) {
            const data = await resp.json();
            if (data) {
              if (data.instrumental) {
                return { lines: [{ time: 0, text: '♪ Instrumental ♪' }], isSynced: true, score: 90 };
              }
              if (data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
                const parsed = parseLrcLyrics(data.syncedLyrics);
                if (parsed.length > 0) return { lines: parsed, isSynced: true, score: 95 };
              } else if (data.plainLyrics && data.plainLyrics.trim().length > 0) {
                const parsed = parsePlainLyrics(data.plainLyrics);
                if (parsed.length > 0) return { lines: parsed, isSynced: false, score: 60 };
              }
            }
          }
        } catch (e) {}
        return null;
      })());
    }

    // Task 4: Direct LRCLIB /api/get with duration (if duration known)
    if (targetInfo.superClean && targetInfo.primaryArtist && targetDurationSec > 0) {
      tasks.push((async () => {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2500);
          const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(targetInfo.superClean)}&artist_name=${encodeURIComponent(targetInfo.primaryArtist)}&duration=${targetDurationSec}`;
          const resp = await fetch(url, { headers: fetchHeaders, signal: ctrl.signal });
          clearTimeout(timer);
          if (resp.ok) {
            const data = await resp.json();
            if (data) {
              if (data.instrumental) {
                return { lines: [{ time: 0, text: '♪ Instrumental ♪' }], isSynced: true, score: 95 };
              }
              if (data.syncedLyrics && data.syncedLyrics.trim().length > 0) {
                const parsed = parseLrcLyrics(data.syncedLyrics);
                if (parsed.length > 0) return { lines: parsed, isSynced: true, score: 100 };
              } else if (data.plainLyrics && data.plainLyrics.trim().length > 0) {
                const parsed = parsePlainLyrics(data.plainLyrics);
                if (parsed.length > 0) return { lines: parsed, isSynced: false, score: 65 };
              }
            }
          }
        } catch (e) {}
        return null;
      })());
    }

    // Task 5: Parallel LRCLIB searches (track + artist, and combined text)
    const searchUrls = [];
    if (targetInfo.superClean && targetInfo.primaryArtist) {
      searchUrls.push(`https://lrclib.net/api/search?track_name=${encodeURIComponent(targetInfo.superClean)}&artist_name=${encodeURIComponent(targetInfo.primaryArtist)}`);
      searchUrls.push(`https://lrclib.net/api/search?q=${encodeURIComponent(targetInfo.superClean + ' ' + targetInfo.primaryArtist)}`);
    } else {
      searchUrls.push(`https://lrclib.net/api/search?q=${encodeURIComponent(targetInfo.superClean || targetInfo.cleanTitle || song.title)}`);
    }

    for (const sUrl of searchUrls) {
      tasks.push((async () => {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2500);
          const resp = await fetch(sUrl, { headers: fetchHeaders, signal: ctrl.signal });
          clearTimeout(timer);
          if (resp.ok) {
            const candidates = await resp.json();
            if (Array.isArray(candidates) && candidates.length > 0) {
              const scored = candidates
                .map(c => ({
                  candidate: c,
                  score: scoreCandidateForLyrics(c, targetInfo, targetDurationSec)
                }))
                .filter(s => s.score >= 25)
                .sort((a, b) => b.score - a.score);

              if (scored.length > 0) {
                const best = scored[0].candidate;
                if (best.instrumental) {
                  return { lines: [{ time: 0, text: '♪ Instrumental ♪' }], isSynced: true, score: 90 };
                }
                if (best.syncedLyrics && best.syncedLyrics.trim().length > 0) {
                  const parsed = parseLrcLyrics(best.syncedLyrics);
                  if (parsed.length > 0) return { lines: parsed, isSynced: true, score: scored[0].score + 10 };
                } else if (best.plainLyrics && best.plainLyrics.trim().length > 0) {
                  const parsed = parsePlainLyrics(best.plainLyrics);
                  if (parsed.length > 0) return { lines: parsed, isSynced: false, score: scored[0].score };
                }
              }
            }
          }
        } catch (e) {}
        return null;
      })());
    }

    // Fast Race: resolve immediately upon first synced lyrics match
    return new Promise((resolve) => {
      let resolved = false;
      let plainFallback = null;
      let remaining = tasks.length;
      let fallbackTimer = null;

      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        if (fallbackTimer) clearTimeout(fallbackTimer);
        resolve(commitLyrics(result ? result.lines : []));
      };

      if (tasks.length === 0) {
        return finish(null);
      }

      tasks.forEach(taskPromise => {
        taskPromise.then(res => {
          if (resolved) return;
          remaining--;

          if (res && res.lines && res.lines.length > 0) {
            if (res.isSynced) {
              // Instant winner! Synced lyrics found in 200-400ms
              return finish(res);
            } else if (!plainFallback) {
              plainFallback = res;
              // Give other tasks 350ms to deliver synced lyrics before settling on plain
              fallbackTimer = setTimeout(() => {
                if (!resolved && plainFallback) {
                  finish(plainFallback);
                }
              }, 350);
            }
          }

          if (remaining <= 0) {
            if (plainFallback) {
              finish(plainFallback);
            } else {
              finish(null);
            }
          }
        }).catch(() => {
          if (resolved) return;
          remaining--;
          if (remaining <= 0) {
            if (plainFallback) finish(plainFallback);
            else finish(null);
          }
        });
      });

      // Overall hard cutoff at 3.5 seconds
      setTimeout(() => {
        if (!resolved) {
          if (plainFallback) finish(plainFallback);
          else finish(null);
        }
      }, 3500);
    });
  })();

  STATE.inFlightLyricsPromises.set(song.videoId, promise);
  promise.finally(() => {
    STATE.inFlightLyricsPromises.delete(song.videoId);
  });
  return promise;
}

async function fetchLyricsForCurrentTrack() {
  if (STATE.currentIndex < 0 || STATE.currentIndex >= STATE.queue.length) return;
  const song = STATE.queue[STATE.currentIndex];
  STATE.lyricsLoadedForSongId = song.videoId;
  STATE.activeLyricIndex = -1;

  if (!STATE.lyricsCache.has(song.videoId)) {
    try {
      const diskRaw = localStorage.getItem('pixelbeats_lyrics_' + song.videoId);
      if (diskRaw) {
        const diskData = JSON.parse(diskRaw);
        if (Array.isArray(diskData)) {
          STATE.lyricsCache.set(song.videoId, diskData);
        }
      }
    } catch (e) {}
  }

  if (STATE.lyricsCache.has(song.videoId)) {
    const cached = STATE.lyricsCache.get(song.videoId);
    STATE.currentLyrics = cached || [];
    if (cached && cached.length > 0) {
      if (STATE.lyricsMode) {
        renderLyricsList();
        if (elements.lyricsStatus) elements.lyricsStatus.classList.add('hidden');
        syncLyricsWithTime(elements.audio ? (elements.audio.currentTime || 0) : 0);
      }
      return;
    } else {
      if (STATE.lyricsMode) {
        if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
        if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
        if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'No lyrics available for this track';
      }
      return;
    }
  }

  if (STATE.lyricsMode) {
    if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
    if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'Searching LRCLIB for live lyrics...';
    if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
  }

  const lyrics = await fetchLyricsForSong(song);

  if (STATE.currentIndex >= 0 && STATE.queue[STATE.currentIndex] && STATE.queue[STATE.currentIndex].videoId === song.videoId && STATE.lyricsLoadedForSongId === song.videoId) {
    STATE.currentLyrics = lyrics || [];
    if (STATE.lyricsMode) {
      if (lyrics && lyrics.length > 0) {
        renderLyricsList();
        if (elements.lyricsStatus) elements.lyricsStatus.classList.add('hidden');
        syncLyricsWithTime(elements.audio ? (elements.audio.currentTime || 0) : 0);
      } else {
        if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
        if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
        if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'No lyrics available for this track';
      }
    }
  }
}

let isUserScrollingLyrics = false;
let userScrollTimer = null;

function renderLyricsList() {
  if (!elements.lyricsScrollList) return;
  const currentSong = STATE.queue[STATE.currentIndex];
  if (!currentSong || STATE.lyricsLoadedForSongId !== currentSong.videoId) {
    elements.lyricsScrollList.innerHTML = '';
    return;
  }
  elements.lyricsScrollList.innerHTML = '';

  STATE.currentLyrics.forEach((line, idx) => {
    const div = document.createElement('div');
    div.className = 'lyric-line';
    div.dataset.index = idx;
    div.textContent = line.text;

    div.addEventListener('click', (e) => {
      e.stopPropagation();
      playHapticSfx('click');
      if (line.time >= 0 && elements.audio) {
        elements.audio.currentTime = line.time;
        isUserScrollingLyrics = false;
        clearTimeout(userScrollTimer);
        syncLyricsWithTime(line.time, true);
        if (!STATE.isPlaying) {
          togglePlayPause();
        }
      }
    });

    elements.lyricsScrollList.appendChild(div);
  });
}

function syncLyricsWithTime(currentTime, forceScroll = false) {
  if (!STATE.lyricsMode || !STATE.currentLyrics || STATE.currentLyrics.length === 0) return;
  const currentSong = STATE.queue[STATE.currentIndex];
  if (!currentSong || STATE.lyricsLoadedForSongId !== currentSong.videoId) return;
  if (STATE.currentLyrics[0].time === -1) return;

  const effectiveTime = currentTime + 0.15;
  let activeIdx = -1;
  for (let i = 0; i < STATE.currentLyrics.length; i++) {
    if (effectiveTime >= STATE.currentLyrics[i].time) {
      activeIdx = i;
    } else {
      break;
    }
  }

  if (activeIdx !== STATE.activeLyricIndex || forceScroll) {
    STATE.activeLyricIndex = activeIdx;
    const list = elements.lyricsScrollList;
    if (!list) return;

    const lines = list.querySelectorAll('.lyric-line');
    let targetActiveElem = null;

    lines.forEach((lineElem, idx) => {
      const isActive = idx === activeIdx;
      const isPassed = idx < activeIdx;
      lineElem.classList.toggle('active', isActive);
      lineElem.classList.toggle('passed', isPassed);
      if (isActive) {
        targetActiveElem = lineElem;
      }
    });

    if (targetActiveElem && (forceScroll || !isUserScrollingLyrics)) {
      const containerRect = list.getBoundingClientRect();
      const activeRect = targetActiveElem.getBoundingClientRect();
      const relativeTop = activeRect.top - containerRect.top + list.scrollTop;
      const scrollToY = relativeTop - (containerRect.height / 2) + (activeRect.height / 2);

      list.scrollTo({
        top: Math.max(0, scrollToY),
        behavior: forceScroll ? 'auto' : 'smooth'
      });
    }
  }
}

// ================= REAL WEB AUDIO EQUALIZER ENGINE =================
let webAudioCtx = null;
let webAudioSource = null;
let eqBands = null;

const EQ_PRESETS = {
  flat: {
    lowShelf: 0,
    midPeak1: 0,
    midPeak2: 0,
    highShelf: 0,
    label: 'Flat'
  },
  bass_boost: {
    lowShelf: 14.0,  // Powerful +14dB punchy low-end
    midPeak1: 3.5,   // +3.5dB lower-mid body
    midPeak2: -2.0,  // -2dB mid scoop
    highShelf: 1.0,  // smooth treble
    label: 'Bass Boost'
  },
  acoustic: {
    lowShelf: 2.0,   // Clean controlled low end
    midPeak1: -4.5,  // Scoop mud at 700Hz
    midPeak2: 6.0,   // Acoustic string presence & resonance
    highShelf: 8.0,  // Open airy top end
    label: 'Acoustic'
  },
  lofi: {
    lowShelf: 8.0,   // Vintage warm low-end
    midPeak1: 5.0,   // Nostalgic tape midrange
    midPeak2: -4.0,  // Subdued presence
    highShelf: -14.0,// Heavy tape/vinyl high-cut roll-off
    label: 'Lo-Fi Warmth'
  },
  crisp: {
    lowShelf: -4.5,  // Cut low-end rumble
    midPeak1: 1.0,
    midPeak2: 9.0,   // Front-stage vocal clarity
    highShelf: 7.0,  // Breath & consonants
    label: 'Vocal Crisp'
  }
};

function initWebAudioEqualizer() {
  if (!elements.audio) return;
  if (webAudioCtx && eqBands) return;

  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) {
      console.warn('[Equalizer] Web Audio API not supported on this platform');
      return;
    }

    if (!webAudioCtx) {
      webAudioCtx = new AudioCtxClass();
    }

    if (!webAudioSource) {
      try {
        elements.audio.crossOrigin = 'anonymous';
        webAudioSource = webAudioCtx.createMediaElementSource(elements.audio);
      } catch (srcErr) {
        console.warn('[Equalizer] MediaElementSource notice:', srcErr);
        return;
      }
    }

    // 4-band Parametric EQ: LowShelf (150Hz), Peaking (750Hz), Peaking (3000Hz), HighShelf (7000Hz)
    const lowShelf = webAudioCtx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 150;

    const midPeak1 = webAudioCtx.createBiquadFilter();
    midPeak1.type = 'peaking';
    midPeak1.frequency.value = 750;
    midPeak1.Q.value = 1.0;

    const midPeak2 = webAudioCtx.createBiquadFilter();
    midPeak2.type = 'peaking';
    midPeak2.frequency.value = 3000;
    midPeak2.Q.value = 1.1;

    const highShelf = webAudioCtx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 7000;

    // Connect audio chain: Source -> LowShelf -> Mid1 -> Mid2 -> HighShelf -> Destination
    try {
      webAudioSource.disconnect();
    } catch (e) {}

    webAudioSource.connect(lowShelf);
    lowShelf.connect(midPeak1);
    midPeak1.connect(midPeak2);
    midPeak2.connect(highShelf);
    highShelf.connect(webAudioCtx.destination);

    eqBands = { lowShelf, midPeak1, midPeak2, highShelf };
    console.log('✨ [Equalizer] Web Audio 4-Band Studio Equalizer successfully linked to stream');

    applyEqPreset(STATE.eqPreset || 'flat', false);

  } catch (err) {
    console.warn('[Equalizer] Pipeline init notice:', err);
  }
}

async function ensureWebAudioActive() {
  if (!webAudioCtx || !eqBands || !webAudioSource) {
    initWebAudioEqualizer();
  }
  if (webAudioCtx && webAudioCtx.state === 'suspended') {
    try {
      await webAudioCtx.resume();
      console.log('[Equalizer] AudioContext active, state:', webAudioCtx.state);
    } catch (e) {
      console.warn('[Equalizer] Resume error:', e);
    }
  }
}

async function applyEqPreset(preset, showUserFeedback = true) {
  STATE.eqPreset = preset;
  localStorage.setItem('pixelbeats_eq', preset);

  // Update UI active states
  document.querySelectorAll('.eq-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.preset === preset);
  });

  const config = EQ_PRESETS[preset] || EQ_PRESETS.flat;

  // 1. Android Native Hardware DSP Equalizer & BassBoost
  try {
    ArchiveTuneBridge.setEqualizerPreset(preset);
  } catch (nativeEqErr) {
    console.warn('[Equalizer] Native EQ notice:', nativeEqErr);
  }

  // 2. Web Audio Pipeline
  await ensureWebAudioActive();

  if (eqBands && webAudioCtx) {
    const t = webAudioCtx.currentTime || 0;
    try {
      eqBands.lowShelf.gain.cancelScheduledValues(t);
      eqBands.midPeak1.gain.cancelScheduledValues(t);
      eqBands.midPeak2.gain.cancelScheduledValues(t);
      eqBands.highShelf.gain.cancelScheduledValues(t);

      eqBands.lowShelf.gain.setValueAtTime(config.lowShelf, t);
      eqBands.midPeak1.gain.setValueAtTime(config.midPeak1, t);
      eqBands.midPeak2.gain.setValueAtTime(config.midPeak2, t);
      eqBands.highShelf.gain.setValueAtTime(config.highShelf, t);

      eqBands.lowShelf.gain.value = config.lowShelf;
      eqBands.midPeak1.gain.value = config.midPeak1;
      eqBands.midPeak2.gain.value = config.midPeak2;
      eqBands.highShelf.gain.value = config.highShelf;

      console.log(`[Equalizer] Applied ${config.label}: Low=${config.lowShelf}dB, Mid1=${config.midPeak1}dB, Mid2=${config.midPeak2}dB, High=${config.highShelf}dB`);
    } catch (eqErr) {
      console.warn('[Equalizer] Param update notice:', eqErr);
    }
  }

  if (showUserFeedback) {
    showToast(`Equalizer: ${config.label}`, 'graphic_eq');
  }
}

// ================= SLEEP TIMER WITH ACCURATE BACKGROUND DETECTION =================
let sleepTimerInterval = null;
let sleepEndTime = null;
let originalPreFadeVolume = null;
let isFadingOut = false;

function setSleepTimer(mode) {
  STATE.sleepTimerMode = mode;
  if (sleepTimerInterval) {
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
  }
  
  // If we were in the middle of fading out, restore original volume
  if (isFadingOut && originalPreFadeVolume !== null && elements.audio) {
    elements.audio.volume = originalPreFadeVolume;
    originalPreFadeVolume = null;
    isFadingOut = false;
  }

  // Update pills UI
  document.querySelectorAll('.sleep-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.time === mode);
  });

  if (mode === '0') {
    sleepEndTime = null;
    updateSleepTimerBadge();
    showToast('Sleep timer turned off', 'timer_off');
    return;
  }

  if (mode === 'end') {
    sleepEndTime = 'end';
    updateSleepTimerBadge();
    showToast('Sleep timer: Pauses at end of this song', 'bedtime');
    return;
  }

  const minutes = parseFloat(mode);
  sleepEndTime = Date.now() + Math.round(minutes * 60 * 1000);
  originalPreFadeVolume = elements.audio ? elements.audio.volume : 0.85;
  showToast(`Sleep timer set: ${minutes} min`, 'bedtime');
  updateSleepTimerBadge();

  sleepTimerInterval = setInterval(checkSleepTimerTick, 1000);
}

function checkSleepTimerTick() {
  if (!sleepEndTime) return;

  if (sleepEndTime === 'end') {
    updateSleepTimerBadge();
    return;
  }

  const now = Date.now();
  const remainingMs = sleepEndTime - now;

  if (remainingMs <= 0) {
    // Timer expired!
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
    sleepEndTime = null;
    STATE.sleepTimerMode = '0';

    if (elements.audio) {
      elements.audio.pause();
      elements.audio.volume = (typeof STATE.currentVolume === 'number' && !isNaN(STATE.currentVolume)) ? STATE.currentVolume : 0.75;
    }
    originalPreFadeVolume = null;
    isFadingOut = false;
    STATE.isPlaying = false;
    updatePlayPauseUI(false);
    updateSleepTimerBadge();

    // Reset pills to Off
    document.querySelectorAll('.sleep-pill').forEach(p => p.classList.toggle('active', p.dataset.time === '0'));
    showToast('Sleep timer expired. Playback paused. 🌙', 'bedtime', 3000);
  } else {
    // Smooth 12s fadeout before pause
    if (remainingMs <= 12000 && elements.audio && !elements.audio.paused) {
      if (!isFadingOut) {
        isFadingOut = true;
        if (originalPreFadeVolume === null) originalPreFadeVolume = elements.audio.volume;
      }
      const fraction = Math.max(0, remainingMs / 12000);
      elements.audio.volume = originalPreFadeVolume * fraction;
    }
    updateSleepTimerBadge();
  }
}

function updateSleepTimerBadge() {
  const badge = document.getElementById('sleep-timer-badge');
  if (!badge) return;

  if (!sleepEndTime) {
    badge.classList.add('hidden');
    badge.textContent = 'Off';
  } else if (sleepEndTime === 'end') {
    badge.classList.remove('hidden');
    badge.textContent = 'End of Song';
  } else {
    const remainingSec = Math.max(0, Math.round((sleepEndTime - Date.now()) / 1000));
    const m = Math.floor(remainingSec / 60);
    const s = remainingSec % 60;
    badge.classList.remove('hidden');
    badge.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}

// Directional Track Slide + Blur Spring Transition
function triggerTrackTransition(direction = 'next') {
  const cover = elements.playerCoverArt;
  const trackInfo = elements.trackTitle ? elements.trackTitle.closest('.track-info-section') : null;
  const animClass = direction === 'prev' ? 'track-spring-prev' : 'track-spring-next';

  if (cover) {
    cover.classList.remove('track-spring-next', 'track-spring-prev');
    void cover.offsetWidth; // Trigger reflow
    cover.classList.add(animClass);
  }

  if (trackInfo) {
    trackInfo.classList.remove('track-spring-next', 'track-spring-prev');
    void trackInfo.offsetWidth;
    trackInfo.classList.add(animClass);
  }

  setTimeout(() => {
    if (cover) cover.classList.remove(animClass);
    if (trackInfo) trackInfo.classList.remove(animClass);
  }, 500);
}

// Touch-Swipe Gestures on Album Cover
function initAlbumCoverGestures() {
  const wrapper = elements.albumArtWrapper;
  if (!wrapper) return;

  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  wrapper.addEventListener('touchstart', (e) => {
    if (STATE.lyricsMode || e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (STATE.lyricsMode || !isSwiping || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (elements.playerCoverArt) {
        elements.playerCoverArt.style.transform = `translateX(${diffX * 0.65}px) rotate(${diffX * 0.04}deg) scale(0.96)`;
      }
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    if (STATE.lyricsMode || !isSwiping) return;
    isSwiping = false;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;

    if (elements.playerCoverArt) {
      elements.playerCoverArt.style.transform = '';
    }

    if (diffX < -50) {
      // Swiped Left -> Next Track
      playHapticSfx('click');
      triggerTrackTransition('next');
      playNextTrack();
    } else if (diffX > 50) {
      // Swiped Right -> Previous Track
      playHapticSfx('click');
      triggerTrackTransition('prev');
      playPrevTrack();
    }
  });

  // Tap Album Cover to Toggle Live Synced Lyrics (disabled while in lyrics mode so scrolling/tapping inside lyrics does not close it)
  wrapper.addEventListener('click', (e) => {
    if (STATE.lyricsMode) return;
    if (e.target.closest('.lyric-line') || e.target.closest('.lyrics-toggle-btn')) return;
    toggleLyricsMode();
  });

  // Prevent any touches or clicks inside the lyrics container from bubbling to album cover gestures
  if (elements.lyricsContainer) {
    elements.lyricsContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    elements.lyricsContainer.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
    elements.lyricsContainer.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
    elements.lyricsContainer.addEventListener('touchend', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  // Close lyrics button in header
  if (elements.btnCloseLyrics) {
    elements.btnCloseLyrics.addEventListener('click', (e) => {
      e.stopPropagation();
      if (STATE.lyricsMode) {
        toggleLyricsMode();
      }
    });
  }
}

// ================= CRISP FULL-HD ALBUM COVER LOADER =================
function loadHdCover(imageUrl, videoId) {
  let targetUrl = imageUrl;
  if (!targetUrl && videoId) {
    targetUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  if (!targetUrl) {
    elements.playerCoverArt.src = 'idle-cover.jpg';
    return;
  }

  elements.artLoading.classList.remove('hidden');

  elements.playerCoverArt.onload = () => {
    elements.artLoading.classList.add('hidden');
    if (elements.miniThumb) elements.miniThumb.src = elements.playerCoverArt.src;
    if (STATE.currentTheme === 'monet') {
      extractMonetPalette(elements.playerCoverArt);
    }
  };

  elements.playerCoverArt.onerror = () => {
    elements.artLoading.classList.add('hidden');
    if (STATE.isBackendAlive && !elements.playerCoverArt.src.includes('/api/image_proxy')) {
      elements.playerCoverArt.src = `${STATE.backendUrl}/api/image_proxy?url=${encodeURIComponent(targetUrl)}`;
    } else {
      elements.playerCoverArt.src = 'idle-cover.jpg';
    }
    if (elements.miniThumb) elements.miniThumb.src = elements.playerCoverArt.src;
  };

  elements.playerCoverArt.src = targetUrl;
}

// ================= OFFLINE VAULT (INDEXEDDB STORAGE) =================
const OfflineVault = {
  db: null,

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('PixelBeatsOfflineDB', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('downloads')) {
          const store = db.createObjectStore('downloads', { keyPath: 'videoId' });
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      req.onerror = (e) => reject(e);
    });
  },

  async saveTrack(track, blob) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('downloads', 'readwrite');
      const store = tx.objectStore('downloads');
      const record = {
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        album: track.album || 'Single',
        duration: track.duration || '--:--',
        thumbnail: track.thumbnail || '',
        blob: blob,
        size: blob.size,
        savedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e);
    });
  },

  async getTrack(videoId) {
    if (!videoId) return null;
    await this.init();
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('downloads', 'readonly');
        const store = tx.objectStore('downloads');
        const req = store.get(videoId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  },

  async getAllTracks() {
    await this.init();
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('downloads', 'readonly');
        const store = tx.objectStore('downloads');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  },

  async deleteTrack(videoId) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('downloads', 'readwrite');
      const store = tx.objectStore('downloads');
      const req = store.delete(videoId);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e);
    });
  }
};

async function downloadSongToVault(track) {
  if (!track || !track.videoId) return;
  playHapticSfx('click');

  const existing = await OfflineVault.getTrack(track.videoId);
  if (existing) {
    showToast('Already in Offline Vault', 'download_done');
    return;
  }

  showToast('Saving to Offline Vault...', 'downloading', 2000);
  if (elements.downloadBtnLabel) elements.downloadBtnLabel.textContent = 'SAVING...';

  try {
    let audioBlob = null;

    // 1. High-Speed Direct Stream Download (< 1 second over direct CDN!)
    try {
      const streamUrl = await resolveStreamUrl(track.videoId);
      if (streamUrl) {
        const resp = await fetch(streamUrl);
        if (resp.ok) {
          audioBlob = await resp.blob();
        }
      }
    } catch (directErr) {
      console.warn('[Vault] Direct CDN stream fetch warning:', directErr);
    }

    // 2. Fallback to PC backend downloader only if direct CDN fetch failed
    if (!audioBlob && STATE.isBackendAlive) {
      const safeTitle = (track.title || 'Track').replace(/[^\w\s-]/gi, '').trim() || 'track';
      const downloadUrl = `${STATE.backendUrl}/api/download?id=${encodeURIComponent(track.videoId)}&title=${encodeURIComponent(safeTitle)}`;
      const resp = await fetch(downloadUrl);
      if (resp.ok) audioBlob = await resp.blob();
    }

    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Audio data could not be downloaded');
    }

    await OfflineVault.saveTrack(track, audioBlob);
    showToast('Saved to Offline Vault', 'download_done');

    updateVaultUI();
    updatePlayerVaultButtonState();
  } catch (err) {
    console.error('[Vault] Download error:', err);
    showToast(`Vault Error: ${err.message}`, 'error', 3000);
  } finally {
    updatePlayerVaultButtonState();
  }
}

async function updatePlayerVaultButtonState() {
  if (!elements.downloadBtnLabel || !elements.btnDownloadTrack) return;
  if (STATE.currentIndex >= 0 && STATE.currentIndex < STATE.queue.length) {
    const cur = STATE.queue[STATE.currentIndex];
    const isSaved = await OfflineVault.getTrack(cur.videoId);
    if (isSaved) {
      elements.downloadBtnLabel.textContent = 'SAVED';
      elements.btnDownloadTrack.classList.add('active');
    } else {
      elements.downloadBtnLabel.textContent = 'SAVE';
      elements.btnDownloadTrack.classList.remove('active');
    }
  } else {
    elements.downloadBtnLabel.textContent = 'SAVE';
    elements.btnDownloadTrack.classList.remove('active');
  }
  enforceSliderStyles();
}

async function updateVaultUI() {
  const tracks = await OfflineVault.getAllTracks();
  const count = tracks.length;

  let totalBytes = 0;
  tracks.forEach(t => { totalBytes += (t.size || 0); });
  const mb = (totalBytes / (1024 * 1024)).toFixed(1);

  if (elements.vaultStorageInfo) {
    elements.vaultStorageInfo.textContent = `${count} Songs • ${mb} MB (Stored locally)`;
  }

  if (STATE.activeTab === 'tab-library' && STATE.activeLibView === 'offline') {
    renderVaultList(tracks);
  }
}

function renderVaultList(cachedTracks = null) {
  const render = (tracks) => {
    if (!tracks || tracks.length === 0) {
      elements.vaultList.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-rounded empty-icon">cloud_off</span>
          <h3>No Offline Tracks</h3>
          <p>Tap SAVE VAULT on any song to store it locally for instant playback with zero internet!</p>
        </div>
      `;
      return;
    }

    elements.vaultList.innerHTML = '';
    tracks.forEach((track, index) => {
      const card = document.createElement('div');
      card.className = 'song-card stagger-item';
      card.style.setProperty('--item-index', index);
      const sizeMb = ((track.size || 0) / (1024 * 1024)).toFixed(1);
      const thumbUrl = track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
      card.innerHTML = `
        <img src="${thumbUrl}" class="song-thumb" alt="Cover" onerror="this.src='icon.jpg'">
        <div class="song-info">
          <div class="song-title">${escapeHtml(track.title)}</div>
          <div class="song-meta">
            <span>${escapeHtml(track.artist)} • ${track.duration || '--:--'} • ${sizeMb} MB</span>
          </div>
        </div>
        <div class="song-actions">
          <button class="song-action-btn btn-vault-play" title="Play Now"><span class="material-symbols-rounded">play_arrow</span></button>
          <button class="song-action-btn btn-vault-queue" title="Queue Track"><span class="material-symbols-rounded">add</span></button>
          <button class="song-action-btn btn-vault-del" title="Remove"><span class="material-symbols-rounded">delete</span></button>
        </div>
      `;

      card.addEventListener('pointerenter', () => prefetchTrackAudioAndLyrics(track), { passive: true, once: true });
      card.addEventListener('pointerdown', () => prefetchTrackAudioAndLyrics(track), { passive: true, once: true });

      card.querySelector('.btn-vault-play').addEventListener('click', (e) => {
        e.stopPropagation();
        playHapticSfx('play');
        prefetchTrackAudioAndLyrics(track);
        addToQueue(track, true);
        document.querySelectorAll('.song-card.playing').forEach(c => c.classList.remove('playing'));
        card.classList.add('playing');
        syncMiniPlayer();
      });

      card.querySelector('.btn-vault-queue').addEventListener('click', (e) => {
        e.stopPropagation();
        playHapticSfx('click');
        addToQueue(track, false);
        showToast('Added to queue', 'queue_music');
      });

      card.querySelector('.btn-vault-del').addEventListener('click', async (e) => {
        e.stopPropagation();
        playHapticSfx('click');
        if (confirm(`Remove "${track.title}" from offline vault?`)) {
          await OfflineVault.deleteTrack(track.videoId);
          showToast('Removed from vault', 'delete');
          updateVaultUI();
        }
      });

      card.addEventListener('click', () => {
        playHapticSfx('play');
        prefetchTrackAudioAndLyrics(track);
        addToQueue(track, true);
        document.querySelectorAll('.song-card.playing').forEach(c => c.classList.remove('playing'));
        card.classList.add('playing');
        syncMiniPlayer();
      });

      elements.vaultList.appendChild(card);
    });
  };

  if (cachedTracks) {
    render(cachedTracks);
  } else {
    OfflineVault.getAllTracks().then(render);
  }
}

// ================= USER PLAYLISTS FEATURE =================
const PlaylistsManager = {
  getPlaylists() {
    try {
      const raw = localStorage.getItem('pixelbeats_playlists');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const initial = [
      { id: 'favorites', name: 'Favorites', tracks: [], createdAt: Date.now() }
    ];
    this.savePlaylists(initial);
    return initial;
  },

  savePlaylists(lists) {
    localStorage.setItem('pixelbeats_playlists', JSON.stringify(lists));
  },

  createPlaylist(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    const lists = this.getPlaylists();
    const newId = 'pl_' + Date.now();
    const newPl = { id: newId, name: trimmed, tracks: [], createdAt: Date.now() };
    lists.push(newPl);
    this.savePlaylists(lists);
    return newPl;
  },

  deletePlaylist(id) {
    if (id === 'favorites') {
      alert('Cannot delete the default Favorites playlist');
      return false;
    }
    let lists = this.getPlaylists();
    lists = lists.filter(l => l.id !== id);
    this.savePlaylists(lists);
    return true;
  },

  addTrack(playlistId, track) {
    const lists = this.getPlaylists();
    const target = lists.find(l => l.id === playlistId);
    if (!target) return false;
    if (target.tracks.some(t => t.videoId === track.videoId)) return false;
    target.tracks.push({
      videoId: track.videoId,
      title: track.title,
      artist: track.artist,
      album: track.album || 'Single',
      duration: track.duration || '--:--',
      thumbnail: track.thumbnail || ''
    });
    this.savePlaylists(lists);
    return true;
  },

  removeTrack(playlistId, videoId) {
    const lists = this.getPlaylists();
    const target = lists.find(l => l.id === playlistId);
    if (!target) return false;
    target.tracks = target.tracks.filter(t => t.videoId !== videoId);
    this.savePlaylists(lists);
    return true;
  }
};

function updateFavoriteButtonState() {
  const currentSong = STATE.queue[STATE.currentIndex];
  const favBtn = document.getElementById('vol-mute-btn');
  const favIcon = document.getElementById('vol-mode-icon');
  if (!favBtn) return;

  favBtn.style.setProperty('background', '#576028', 'important');
  favBtn.style.setProperty('background-color', '#576028', 'important');
  if (favIcon) {
    favIcon.style.setProperty('color', '#EFF2E1', 'important');
  }

  if (!currentSong || !currentSong.videoId) {
    favBtn.classList.remove('is-favorite');
    if (favIcon) {
      favIcon.textContent = 'favorite_border';
    }
    favBtn.title = 'Add to Favorites';
    return;
  }

  const playlists = PlaylistsManager.getPlaylists();
  const favPl = playlists.find(p => p.id === 'favorites');
  const isFav = favPl && favPl.tracks && favPl.tracks.some(t => t.videoId === currentSong.videoId);

  favBtn.classList.toggle('is-favorite', !!isFav);
  if (favIcon) {
    favIcon.textContent = isFav ? 'favorite' : 'favorite_border';
  }
  favBtn.title = isFav ? 'Remove from Favorites' : 'Add to Favorites';
}

function toggleFavoriteCurrentTrack() {
  const currentSong = STATE.queue[STATE.currentIndex];
  if (!currentSong || !currentSong.videoId) {
    showToast('Play a song to favorite it', 'favorite_border', 1500);
    return;
  }

  const playlists = PlaylistsManager.getPlaylists();
  const favPl = playlists.find(p => p.id === 'favorites');
  const isFav = favPl && favPl.tracks && favPl.tracks.some(t => t.videoId === currentSong.videoId);

  if (isFav) {
    PlaylistsManager.removeTrack('favorites', currentSong.videoId);
    showToast('Removed from Favorites', 'heart_broken', 1500);
    playHapticSfx('click');
  } else {
    PlaylistsManager.addTrack('favorites', currentSong);
    showToast('Added to Favorites ❤️', 'favorite', 1800);
    playHapticSfx('play');
  }

  updateFavoriteButtonState();

  if (STATE.currentViewingPlaylistId === 'favorites') {
    const updatedFav = PlaylistsManager.getPlaylists().find(p => p.id === 'favorites');
    if (updatedFav) renderPlaylistTracks(updatedFav);
  }
  if (STATE.activeTab === 'tab-library' && STATE.activeLibView === 'playlists') {
    renderPlaylistsGrid();
  }
}

function renderPlaylistsGrid() {
  const lists = PlaylistsManager.getPlaylists();
  elements.playlistsGrid.innerHTML = '';

  lists.forEach(pl => {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    const firstThumb = pl.tracks.length > 0 && pl.tracks[0].thumbnail ? pl.tracks[0].thumbnail : '';

    card.innerHTML = `
      ${firstThumb ? `<img src="${firstThumb}" class="playlist-card-cover" alt="Cover" onerror="this.src='icon.jpg'">` : `<div class="playlist-card-cover"><span class="material-symbols-rounded">playlist_play</span></div>`}
      <div class="playlist-card-title">${escapeHtml(pl.name)}</div>
      <div class="playlist-card-count">${pl.tracks.length} Tracks</div>
    `;

    card.addEventListener('click', () => {
      playHapticSfx('click');
      openPlaylistModal(pl.id);
    });

    elements.playlistsGrid.appendChild(card);
  });
}

function openPlaylistModal(playlistId) {
  STATE.currentViewingPlaylistId = playlistId;
  const lists = PlaylistsManager.getPlaylists();
  const pl = lists.find(l => l.id === playlistId);
  if (!pl) return;

  elements.modalPlaylistName.textContent = pl.name;
  elements.btnModalPlaylistDelete.style.display = pl.id === 'favorites' ? 'none' : 'flex';

  renderPlaylistTracks(pl);
  elements.modalPlaylist.classList.remove('hidden');
}

function renderPlaylistTracks(pl) {
  elements.modalPlaylistTracks.innerHTML = '';
  if (pl.tracks.length === 0) {
    elements.modalPlaylistTracks.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">playlist_add</span>
        <h3>Playlist is Empty</h3>
        <p>Add songs from Search, Player, or Albums!</p>
      </div>
    `;
    return;
  }

  pl.tracks.forEach((track, idx) => {
    const item = document.createElement('div');
    item.className = 'album-track-item';
    const thumbUrl = track.thumbnail || (track.videoId ? `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg` : 'icon.jpg');
    item.innerHTML = `
      <img src="${thumbUrl}" class="song-thumb" alt="Cover" onerror="this.src='icon.jpg'">
      <div class="album-track-info">
        <div class="album-track-title">${escapeHtml(track.title)}</div>
        <div class="album-track-dur">${escapeHtml(track.artist)} • ${track.duration || '--:--'}</div>
      </div>
      <div class="track-action-btns">
        <button class="track-action-btn btn-pl-track-play" title="Play"><span class="material-symbols-rounded">play_arrow</span></button>
        <button class="track-action-btn btn-pl-track-dl" title="Save to Vault"><span class="material-symbols-rounded">download</span></button>
        <button class="track-action-btn btn-pl-track-remove" title="Remove"><span class="material-symbols-rounded">delete</span></button>
      </div>
    `;

    item.addEventListener('pointerenter', () => prefetchTrackAudioAndLyrics(track), { passive: true, once: true });
    item.addEventListener('pointerdown', () => prefetchTrackAudioAndLyrics(track), { passive: true, once: true });

    item.addEventListener('click', (e) => {
      if (e.target.closest('.track-action-btn')) return;
      playHapticSfx('play');
      prefetchTrackAudioAndLyrics(track);
      addToQueue(track, true);
      elements.modalPlaylist.classList.add('hidden');
      switchTab('tab-player');
      syncMiniPlayer();
    });

    item.querySelector('.btn-pl-track-play').addEventListener('click', (e) => {
      e.stopPropagation();
      playHapticSfx('play');
      prefetchTrackAudioAndLyrics(track);
      addToQueue(track, true);
      elements.modalPlaylist.classList.add('hidden');
      switchTab('tab-player');
      syncMiniPlayer();
    });

    item.querySelector('.btn-pl-track-dl').addEventListener('click', () => {
      downloadSongToVault(track);
    });

    item.querySelector('.btn-pl-track-remove').addEventListener('click', () => {
      playHapticSfx('click');
      PlaylistsManager.removeTrack(pl.id, track.videoId);
      const updated = PlaylistsManager.getPlaylists().find(l => l.id === pl.id);
      renderPlaylistTracks(updated);
      renderPlaylistsGrid();
    });

    elements.modalPlaylistTracks.appendChild(item);
  });
}

function openPlaylistPicker(track) {
  if (!track) return;
  playHapticSfx('click');
  STATE.pendingPickerTrack = track;
  elements.pickerTrackLabel.textContent = `Song: ${track.title.slice(0, 34)}...`;

  const lists = PlaylistsManager.getPlaylists();
  elements.pickerPlaylistsList.innerHTML = '';

  lists.forEach(pl => {
    const item = document.createElement('div');
    item.className = 'picker-playlist-item';
    const hasIt = pl.tracks.some(t => t.videoId === track.videoId);
    item.innerHTML = `
      <span>${escapeHtml(pl.name)} (${pl.tracks.length})</span>
      <span class="material-symbols-rounded">${hasIt ? 'check' : 'add'}</span>
    `;

    item.addEventListener('click', () => {
      if (hasIt) {
        showToast('Already in this playlist', 'info');
        return;
      }
      PlaylistsManager.addTrack(pl.id, track);
      playHapticSfx('click');
      showToast(`Added to "${pl.name}"`, 'playlist_add');
      elements.modalPlaylistPicker.classList.add('hidden');
      renderPlaylistsGrid();
    });

    elements.pickerPlaylistsList.appendChild(item);
  });

  elements.modalPlaylistPicker.classList.remove('hidden');
}

// ================= MUSIC ALBUMS FEATURE =================
async function searchAlbums(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  if (STATE.backendUrl) {
    try {
      const resp = await fetch(`${STATE.backendUrl}/api/albums?q=${encodeURIComponent(q)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0) {
          STATE.isBackendAlive = true;
          return data;
        }
      }
    } catch (e) {
      console.warn('[Backend] Album search error:', e);
    }
  }
  return [];
}

function renderAlbumResults(albums) {
  elements.searchSpinner.classList.add('hidden');
  if (!albums || albums.length === 0) {
    elements.searchResults.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">album</span>
        <h3>No Albums Found</h3>
        <p>Try searching for a different album title or artist</p>
      </div>
    `;
    return;
  }

  elements.searchResults.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'albums-grid';

  albums.forEach(alb => {
    const card = document.createElement('div');
    card.className = 'album-card';
    const thumbUrl = alb.thumbnail || '';
    card.innerHTML = `
      <img src="${thumbUrl}" class="album-card-thumb" alt="Cover" onerror="this.src='icon.jpg'">
      <div class="album-card-title">${escapeHtml(alb.title)}</div>
      <div class="album-card-artist">${escapeHtml(alb.artist)}</div>
      <div class="album-card-year">${alb.year ? alb.year : ''}</div>
    `;

    card.addEventListener('click', () => {
      playHapticSfx('click');
      openAlbumModal(alb.browseId);
    });

    grid.appendChild(card);
  });

  elements.searchResults.appendChild(grid);
}

async function renderLibraryAlbums() {
  elements.libAlbumsGrid.innerHTML = `
    <div class="empty-state" style="grid-column: span 2;">
      <div class="m3-spinner"></div>
      <p>Loading featured albums...</p>
    </div>
  `;

  try {
    const sampleQuery = 'Top Hits 2026';
    const albums = await searchAlbums(sampleQuery);
    if (!albums || albums.length === 0) {
      elements.libAlbumsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: span 2;">
          <span class="material-symbols-rounded empty-icon">album</span>
          <h3>Explore Albums</h3>
          <p>Search for any album in the Search tab!</p>
        </div>
      `;
      return;
    }

    elements.libAlbumsGrid.innerHTML = '';
    albums.forEach(alb => {
      const card = document.createElement('div');
      card.className = 'album-card';
      const thumbUrl = alb.thumbnail || '';
      card.innerHTML = `
        <img src="${thumbUrl}" class="album-card-thumb" alt="Cover" onerror="this.src='icon.jpg'">
        <div class="album-card-title">${escapeHtml(alb.title)}</div>
        <div class="album-card-artist">${escapeHtml(alb.artist)}</div>
        <div class="album-card-year">${alb.year ? alb.year : ''}</div>
      `;

      card.addEventListener('click', () => {
        playHapticSfx('click');
        openAlbumModal(alb.browseId);
      });

      elements.libAlbumsGrid.appendChild(card);
    });
  } catch (e) {
    elements.libAlbumsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: span 2;">
        <span class="material-symbols-rounded empty-icon">album</span>
        <p>Search albums in the Search tab</p>
      </div>
    `;
  }
}

async function openAlbumModal(browseId) {
  if (!browseId) return;
  playHapticSfx('click');
  elements.modalAlbum.classList.remove('hidden');
  elements.modalAlbumTitle.textContent = 'Loading Album...';
  elements.modalAlbumArtist.textContent = 'Fetching tracklist...';
  elements.modalAlbumMeta.textContent = '--';
  elements.modalAlbumTracks.innerHTML = `
    <div style="padding: 24px; text-align: center;">
      <div class="m3-spinner"></div>
    </div>
  `;

  try {
    const resp = await fetch(`${STATE.backendUrl}/api/album?browseId=${encodeURIComponent(browseId)}`);
    if (!resp.ok) throw new Error('Could not fetch album details');
    const albumData = await resp.json();
    STATE.currentViewingAlbum = albumData;

    elements.modalAlbumTitle.textContent = albumData.title;
    elements.modalAlbumArtist.textContent = albumData.artist;
    elements.modalAlbumMeta.textContent = `${albumData.year || ''} • ${albumData.tracks.length} Tracks • ${albumData.duration || ''}`;
    elements.modalAlbumArt.src = albumData.thumbnail || 'icon.jpg';
    elements.modalAlbumArt.onerror = () => { elements.modalAlbumArt.src = 'icon.jpg'; };

    elements.modalAlbumTracks.innerHTML = '';
    albumData.tracks.forEach((track, idx) => {
      const item = document.createElement('div');
      item.className = 'album-track-item';
      const thumbUrl = track.thumbnail || albumData.thumbnail || 'icon.jpg';
      item.innerHTML = `
        <img src="${thumbUrl}" class="song-thumb" alt="Cover" onerror="this.src='icon.jpg'">
        <div class="album-track-info">
          <div class="album-track-title">${escapeHtml(track.title)}</div>
          <div class="album-track-dur">${escapeHtml(track.artist)} • ${track.duration || '--:--'}</div>
        </div>
        <div class="track-action-btns">
          <button class="track-action-btn btn-album-track-play" title="Play"><span class="material-symbols-rounded">play_arrow</span></button>
          <button class="track-action-btn btn-album-track-playlist" title="Playlist"><span class="material-symbols-rounded">playlist_add</span></button>
          <button class="track-action-btn btn-album-track-dl" title="Save"><span class="material-symbols-rounded">download</span></button>
        </div>
      `;

      item.addEventListener('pointerenter', () => prefetchTrackAudioAndLyrics(track), { passive: true, once: true });
      item.addEventListener('pointerdown', () => prefetchTrackAudioAndLyrics(track), { passive: true, once: true });

      item.addEventListener('click', (e) => {
        if (e.target.closest('.track-action-btn')) return;
        playHapticSfx('play');
        prefetchTrackAudioAndLyrics(track);
        addToQueue(track, true);
        elements.modalAlbum.classList.add('hidden');
        switchTab('tab-player');
        syncMiniPlayer();
      });

      item.querySelector('.btn-album-track-play').addEventListener('click', (e) => {
        e.stopPropagation();
        playHapticSfx('play');
        prefetchTrackAudioAndLyrics(track);
        addToQueue(track, true);
        elements.modalAlbum.classList.add('hidden');
        switchTab('tab-player');
        syncMiniPlayer();
      });

      item.querySelector('.btn-album-track-playlist').addEventListener('click', () => {
        openPlaylistPicker(track);
      });

      item.querySelector('.btn-album-track-dl').addEventListener('click', () => {
        downloadSongToVault(track);
      });

      elements.modalAlbumTracks.appendChild(item);
    });

  } catch (err) {
    elements.modalAlbumTracks.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">error</span>
        <h3>Failed to Load Album</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

// ================= BACKEND & PIPED DUAL-ENGINE RESOLVER =================
async function probeBackendCandidate(targetUrl) {
  if (!targetUrl) return null;
  const target = targetUrl.replace(/\/+$/, '');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const resp = await fetch(`${target}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (resp.ok) return target;
  } catch (e) {
    clearTimeout(timeoutId);
  }
  return null;
}

async function testBackendHealth(url) {
  if (url) {
    const result = await probeBackendCandidate(url);
    if (result) {
      STATE.backendUrl = result;
      STATE.isBackendAlive = true;
      localStorage.setItem('pixelbeats_backend_url', result);
      updateStatusBadge('ONLINE', true);
      return true;
    }
    STATE.isBackendAlive = false;
    updateStatusBadge(ArchiveTuneBridge.isNative() ? 'ARCHIVETUNE NATIVE' : 'STANDALONE', true);
    return false;
  }

  // If a custom remote server was explicitly saved, test it in background
  if (STATE.backendUrl && !STATE.backendUrl.includes('192.168.')) {
    const result = await probeBackendCandidate(STATE.backendUrl);
    if (result) {
      STATE.isBackendAlive = true;
      updateStatusBadge('ONLINE', true);
      return true;
    }
  }

  // Standalone mode is active by default: runs on device with zero server needed!
  STATE.isBackendAlive = false;
  updateStatusBadge(ArchiveTuneBridge.isNative() ? 'ARCHIVETUNE NATIVE' : 'STANDALONE', true);
  return false;
}

function updateStatusBadge(label, isOnline) {
  if (!elements.statusLabel || !elements.statusPill) return;
  elements.statusLabel.textContent = label;
  elements.statusPill.classList.toggle('offline', !isOnline);
}

async function searchSongs(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  // 1. Standalone Native ArchiveTune Engine (Runs on device inside Android APK)
  if (ArchiveTuneBridge.isNative()) {
    try {
      const nativeTracks = await ArchiveTuneBridge.search(q);
      if (nativeTracks && nativeTracks.length > 0) {
        console.log(`[ArchiveTune Native] Search found ${nativeTracks.length} tracks for '${q}'`);
        updateStatusBadge('ARCHIVETUNE NATIVE', true);
        return nativeTracks;
      }
    } catch (nativeErr) {
      console.warn('[ArchiveTune Native] Search notice:', nativeErr);
    }
  }

  // 2. Optional Custom Remote Proxy (if configured and reachable)
  if (STATE.backendUrl && STATE.isBackendAlive) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch(`${STATE.backendUrl}/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0) {
          updateStatusBadge('ONLINE', true);
          return data;
        }
      }
    } catch (e) {
      console.warn('[Backend] Custom search notice:', e.message);
    }
  }

  // 3. Direct High-Speed Verified Standalone Mirrors (Piped / Invidious)
  const pipedEndpoints = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.private.coffee',
    'https://pipedapi.in.projectsegfau.lt'
  ];

  for (const base of pipedEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const url = `${base}/search?q=${encodeURIComponent(q)}&filter=music_songs`;
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const data = await resp.json();
        const items = data.items || [];
        if (Array.isArray(items) && items.length > 0) {
          updateStatusBadge('STANDALONE', true);
          return items.map(item => ({
            videoId: (item.url || '').replace('/watch?v=', ''),
            title: item.title || 'Unknown Title',
            artist: item.uploaderName || 'Unknown Artist',
            album: 'Single',
            duration: formatSecondsToTime(item.duration || 0),
            thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${(item.url || '').replace('/watch?v=', '')}/hqdefault.jpg`
          })).filter(s => s.videoId);
        }
      }
    } catch (e) {
      continue;
    }
  }

  // 2. High-speed Fallback across verified public mirrors
  if (STATE.autoFallback) {
    const tryPiped = async (baseUrl) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const url = `${baseUrl}/search?q=${encodeURIComponent(q)}&filter=music_songs`;
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!resp.ok) throw new Error('Search failed');
      const data = await resp.json();
      const items = data.items || [];
      if (!Array.isArray(items) || items.length === 0) throw new Error('Empty');
      return items.map(item => ({
        videoId: (item.url || '').replace('/watch?v=', ''),
        title: item.title || 'Unknown Title',
        artist: item.uploaderName || 'Unknown Artist',
        album: 'Single',
        duration: formatSecondsToTime(item.duration || 0),
        thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${(item.url || '').replace('/watch?v=', '')}/hqdefault.jpg`
      })).filter(s => s.videoId);
    };

    try {
      return await tryPiped('https://api.piped.private.coffee');
    } catch (fallbackErr) {
      console.warn('[Fallback Search] Piped fallback failed:', fallbackErr);
    }
  }

  throw new Error('All search providers failed. Please check internet connection.');
}

const audioWarmCache = new Set();
function warmUpAudioUrl(url) {
  if (!url || audioWarmCache.has(url) || url.startsWith('blob:')) return;
  audioWarmCache.add(url);
  try {
    const preloader = new Audio();
    preloader.preload = 'auto';
    preloader.src = url;
    preloader.load();
    setTimeout(() => {
      if (elements.audio && elements.audio.src !== url) {
        preloader.src = '';
      }
    }, 60000);
  } catch (e) {}
}

function prefetchTrackAudioAndLyrics(song) {
  if (!song || !song.videoId) return;

  // 1. Resolve Audio Stream in background & warm up buffer
  if (!STATE.prefetchedStreams.has(song.videoId) && !STATE.inFlightStreamPromises.has(song.videoId)) {
    resolveStreamUrl(song.videoId).then(url => {
      if (url) warmUpAudioUrl(url);
    }).catch(() => {});
  }

  // 2. Resolve Live Synced Lyrics in parallel
  if (!STATE.lyricsCache.has(song.videoId) && !STATE.inFlightLyricsPromises.has(song.videoId)) {
    fetchLyricsForSong(song).catch(() => {});
  }
}

async function resolveStreamUrl(videoId) {
  if (!videoId) throw new Error('Invalid videoId');

  // 1. Offline Vault
  try {
    const offlineRecord = await OfflineVault.getTrack(videoId);
    if (offlineRecord && offlineRecord.blob) {
      console.log(`[Stream] Playing from OFFLINE VAULT: ${offlineRecord.title}`);
      const blobUrl = URL.createObjectURL(offlineRecord.blob);
      if (elements.sourceIndicator) elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">cloud_done</span>OFFLINE VAULT';
      showToast('Playing from Offline Vault', 'cloud_done', 1800);
      return blobUrl;
    }
  } catch (vaultErr) {}

  // 2. Prefetch Cache (Instant 0ms start!)
  if (STATE.prefetchedStreams.has(videoId)) {
    return STATE.prefetchedStreams.get(videoId);
  }

  // 3. In-flight Promise deduplication
  if (STATE.inFlightStreamPromises.has(videoId)) {
    return STATE.inFlightStreamPromises.get(videoId);
  }

  const promise = (async () => {
    // 4. Standalone Native ArchiveTune Engine (Runs on-device inside Android APK!)
    if (ArchiveTuneBridge.isNative()) {
      try {
        const nativeRes = await ArchiveTuneBridge.resolveStream(videoId);
        if (nativeRes && nativeRes.streamUrl) {
          if (elements.sourceIndicator) {
            elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">bolt</span>ARCHIVETUNE NATIVE';
          }
          console.log(`[ArchiveTune Native] Direct stream resolved (${nativeRes.bitrate} bps)`);
          STATE.prefetchedStreams.set(videoId, nativeRes.streamUrl);
          warmUpAudioUrl(nativeRes.streamUrl);
          return nativeRes.streamUrl;
        }
      } catch (nativeErr) {
        console.warn('[ArchiveTune Native] Stream resolve error:', nativeErr);
      }
    }

    // 4b. Optional Custom Remote Proxy (if configured and online)
    if (STATE.backendUrl && STATE.isBackendAlive) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(`${STATE.backendUrl}/api/stream?id=${encodeURIComponent(videoId)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (resp.ok) {
          const data = await resp.json();
          const chosenUrl = data.proxy_url ? `${STATE.backendUrl}${data.proxy_url}` : data.stream_url;
          if (chosenUrl) {
            STATE.prefetchedStreams.set(videoId, chosenUrl);
            warmUpAudioUrl(chosenUrl);
            return chosenUrl;
          }
        }
      } catch (e) {}
    }

    // 5. High-Speed Standalone Public Mirrors (Piped / Invidious)
    const pipedEndpoints = [
      'https://pipedapi.kavin.rocks',
      'https://api.piped.private.coffee',
      'https://pipedapi.in.projectsegfau.lt'
    ];

    for (const base of pipedEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const resp = await fetch(`${base}/streams/${videoId}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (resp.ok) {
          const data = await resp.json();
          const audios = data.audioStreams || [];
          if (audios.length > 0) {
            audios.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
            const best = audios[0].url;
            if (elements.sourceIndicator) {
              elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">cloud</span>STANDALONE';
            }
            STATE.prefetchedStreams.set(videoId, best);
            warmUpAudioUrl(best);
            return best;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Invidious mirror fallback
    try {
      const resp = await fetch(`https://invidious.f5.si/api/v1/videos/${videoId}`);
      if (resp.ok) {
        const data = await resp.json();
        const adaptive = data.adaptiveFormats || [];
        const audios = adaptive.filter(f => (f.type || '').startsWith('audio/') && f.url);
        if (audios.length > 0) {
          audios.sort((a, b) => parseInt(b.bitrate || 0) - parseInt(a.bitrate || 0));
          const best = audios[0].url;
          STATE.prefetchedStreams.set(videoId, best);
          warmUpAudioUrl(best);
          return best;
        }
      }
    } catch (e) {}

    throw new Error('Could not resolve audio stream. Please check your internet connection.');
  })().finally(() => {
    STATE.inFlightStreamPromises.delete(videoId);
  });

  STATE.inFlightStreamPromises.set(videoId, promise);
  return promise;
}

async function prefetchNextSong() {
  const nextIdx = STATE.currentIndex + 1;
  if (nextIdx < STATE.queue.length) {
    const nextSong = STATE.queue[nextIdx];
    if (nextSong) {
      if (elements.prefetchIndicator) elements.prefetchIndicator.classList.remove('hidden');
      try {
        prefetchTrackAudioAndLyrics(nextSong);
      } catch (e) {}
    }
  } else {
    if (elements.prefetchIndicator) elements.prefetchIndicator.classList.add('hidden');
  }

  // Pre-resolve 2 tracks ahead for zero-gap playback and instant lyrics
  const afterNextIdx = STATE.currentIndex + 2;
  if (afterNextIdx < STATE.queue.length) {
    const afterSong = STATE.queue[afterNextIdx];
    if (afterSong) {
      try {
        prefetchTrackAudioAndLyrics(afterSong);
      } catch (e) {}
    }
  }
}

// ================= PLAYBACK CONTROLLER =================
async function playTrackAtIndex(index) {
  if (index < 0 || index >= STATE.queue.length) return;
  const prevIndex = STATE.currentIndex;
  if (prevIndex !== -1 && prevIndex !== index) {
    triggerTrackTransition(index > prevIndex ? 'next' : 'prev');
  }
  STATE.currentIndex = index;
  const song = STATE.queue[index];

  // 1. Immediately pause old playback so previous audio stops cleanly
  if (elements.audio) {
    try {
      elements.audio.pause();
    } catch (e) {}
  }
  STATE.isPlaying = false;
  updatePlayPauseUI(false);

  // 2. Reset timeline & scrubber to 0:00 for the incoming track
  if (elements.seekSlider) elements.seekSlider.value = 0;
  if (elements.scrubberFill) elements.scrubberFill.style.width = '0%';
  if (elements.timeCurrent) elements.timeCurrent.textContent = '00:00';
  if (elements.timeDuration) elements.timeDuration.textContent = song.duration || '00:00';

  // 3. Update track metadata, visuals & queue
  elements.trackTitle.textContent = song.title;
  elements.trackArtist.textContent = `${song.artist} • ${song.album || 'Single'}`;

  loadHdCover(song.thumbnail, song.videoId);
  syncMiniPlayer();
  renderQueueList();
  updatePlayerVaultButtonState();
  updateFavoriteButtonState();
  enforceSliderStyles();

  // 4. Reset live lyrics state for incoming track
  STATE.lyricsLoadedForSongId = song.videoId;
  STATE.activeLyricIndex = -1;
  STATE.currentLyrics = [];

  if (STATE.lyricsMode) {
    if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
    if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
    if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'Searching LRCLIB for live lyrics...';
  }

  // 5. Check in-memory & persistent cache or start parallel live lyrics fetch
  if (!STATE.lyricsCache.has(song.videoId)) {
    try {
      const diskRaw = localStorage.getItem('pixelbeats_lyrics_' + song.videoId);
      if (diskRaw) {
        const diskData = JSON.parse(diskRaw);
        if (Array.isArray(diskData)) {
          STATE.lyricsCache.set(song.videoId, diskData);
        }
      }
    } catch (e) {}
  }

  if (STATE.lyricsCache.has(song.videoId)) {
    const cached = STATE.lyricsCache.get(song.videoId);
    STATE.lyricsLoadedForSongId = song.videoId;
    STATE.currentLyrics = cached || [];
    if (cached && cached.length > 0) {
      if (STATE.lyricsMode) {
        renderLyricsList();
        if (elements.lyricsStatus) elements.lyricsStatus.classList.add('hidden');
        syncLyricsWithTime(0);
      }
    } else {
      if (STATE.lyricsMode) {
        if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
        if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
        if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'No lyrics available for this track';
      }
    }
  } else {
    // Parallel live lyrics fetch
    fetchLyricsForSong(song).then(lyrics => {
      if (STATE.currentIndex === index && STATE.queue[STATE.currentIndex]?.videoId === song.videoId && STATE.lyricsLoadedForSongId === song.videoId) {
        STATE.currentLyrics = lyrics || [];
        if (STATE.lyricsMode) {
          if (lyrics && lyrics.length > 0) {
            renderLyricsList();
            if (elements.lyricsStatus) elements.lyricsStatus.classList.add('hidden');
            syncLyricsWithTime(elements.audio ? (elements.audio.currentTime || 0) : 0);
          } else {
            if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
            if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
            if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'No lyrics available for this track';
          }
        }
      }
    }).catch(() => {
      if (STATE.currentIndex === index && STATE.lyricsLoadedForSongId === song.videoId) {
        if (elements.lyricsScrollList) elements.lyricsScrollList.innerHTML = '';
        if (elements.lyricsStatus) elements.lyricsStatus.classList.remove('hidden');
        if (elements.lyricsStatusText) elements.lyricsStatusText.textContent = 'No lyrics available for this track';
      }
    });
  }

  if (elements.sourceIndicator) {
    elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">sync</span>CONNECTING...';
  }

  try {
    const streamUrl = await resolveStreamUrl(song.videoId);
    if (STATE.currentIndex !== index) return;

    elements.audio.preload = 'auto';
    if (elements.audio.src !== streamUrl) {
      elements.audio.src = streamUrl;
    }
    elements.audio.muted = false;
    const currentVol = (typeof STATE.currentVolume === 'number' && !isNaN(STATE.currentVolume)) ? STATE.currentVolume : 0.75;
    elements.audio.volume = currentVol;
    updateVolumeVisuals(currentVol);

    try {
      ensureWebAudioActive();
      await elements.audio.play();
    } catch (playErr) {
      console.warn('[Playback] Direct stream retry with proxy...', playErr);
      if (STATE.backendUrl && !streamUrl.includes('/api/proxy') && !streamUrl.startsWith('blob:')) {
        elements.audio.src = `${STATE.backendUrl}/api/proxy?url=${encodeURIComponent(streamUrl)}`;
        ensureWebAudioActive();
        await elements.audio.play();
      } else {
        throw playErr;
      }
    }

    STATE.isPlaying = true;
    updatePlayPauseUI(true);

    if (streamUrl.startsWith('blob:')) {
      if (elements.sourceIndicator) elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">cloud_done</span>OFFLINE VAULT';
    } else {
      if (elements.sourceIndicator) elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">cell_tower</span>STREAM HD';
    }

    updateMediaSession(song);
    prefetchNextSong();

    if (STATE.isAutoCycle) {
      fetchAndAppendSimilarCycle(song.videoId);
    }

  } catch (err) {
    console.error('[Playback] Error playing track:', err);
    if (elements.sourceIndicator) elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">error</span>STREAM ERR';
    showToast(`Playback Error: ${song.title}`, 'error', 3000);
  }
}

let isFetchingSimilar = false;
let activeQueueSessionId = 0;
let queueAbortController = null;
let currentAutoQueueRootVideoId = null;

async function fetchAndAppendSimilarCycle(videoId) {
  if (!videoId || !STATE.isAutoCycle || isFetchingSimilar) return;
  // If auto-queue is already actively loading fresh recommendations for this root track, let it finish
  if (currentAutoQueueRootVideoId === videoId && STATE.currentIndex === 0 && STATE.queue.length <= 1) return;

  const session = activeQueueSessionId;
  isFetchingSimilar = true;

  try {
    let similarTracks = [];
    if (STATE.isBackendAlive) {
      const cur = STATE.queue[STATE.currentIndex] || {};
      const resp = await fetch(`${STATE.backendUrl}/api/recommendations?videoId=${encodeURIComponent(videoId)}&artist=${encodeURIComponent(cur.artist || '')}`);
      if (resp.ok) similarTracks = await resp.json();
    }

    if (!similarTracks || similarTracks.length === 0) {
      const pipedUrl = `${getPipedBaseUrl()}/streams/${videoId}`;
      const resp = await fetch(pipedUrl);
      if (resp.ok) {
        const data = await resp.json();
        const related = data.relatedStreams || [];
        similarTracks = related.map(r => ({
          videoId: (r.url || '').replace('/watch?v=', ''),
          title: r.title || 'Unknown Title',
          artist: r.uploaderName || 'Unknown Artist',
          album: 'Single',
          duration: formatSecondsToTime(r.duration || 0),
          thumbnail: r.thumbnail || `https://i.ytimg.com/vi/${(r.url || '').replace('/watch?v=', '')}/hqdefault.jpg`
        }));
      }
    }

    // Discard results if the user switched songs or selected a new track from search in the meantime
    if (session !== activeQueueSessionId) return;
    if (STATE.queue.length === 0 || !STATE.queue[STATE.currentIndex] || STATE.queue[STATE.currentIndex].videoId !== videoId) return;

    if (similarTracks && similarTracks.length > 0) {
      const existingIds = new Set(STATE.queue.map(s => s.videoId));
      const freshTracks = similarTracks.filter(t => t.videoId && !existingIds.has(t.videoId));

      if (freshTracks.length > 0) {
        const toAdd = freshTracks.slice(0, 10);
        toAdd.forEach(t => STATE.queue.push(t));
        updateQueueBadges();
        renderQueueList();
      }
    }
  } catch (err) {
    console.warn('[Auto-Cycle] Error:', err);
  } finally {
    isFetchingSimilar = false;
  }
}

function updatePlayPauseUI(isPlaying) {
  if (elements.playIcon && elements.btnPlay) {
    if (isPlaying) {
      elements.playIcon.textContent = 'pause';
      elements.btnPlay.classList.add('playing');
    } else {
      elements.playIcon.textContent = 'play_arrow';
      elements.btnPlay.classList.remove('playing');
    }
  }

  if (elements.albumArtWrapper) {
    elements.albumArtWrapper.classList.toggle('playing', isPlaying);
  }

  if (elements.miniPlayIcon) {
    elements.miniPlayIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
  }

  syncMiniPlayer();

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {}
  }

  if (ArchiveTuneBridge.isNative()) {
    ArchiveTuneBridge.updatePlaybackState({
      isPlaying: isPlaying,
      position: (elements.audio && !isNaN(elements.audio.currentTime)) ? elements.audio.currentTime : 0,
      duration: (elements.audio && !isNaN(elements.audio.duration)) ? elements.audio.duration : 0
    });
  }
}

function togglePlayPause() {
  playHapticSfx('play');
  if (STATE.currentIndex === -1 && STATE.queue.length > 0) {
    playTrackAtIndex(0);
    return;
  }
  if (!elements.audio.src && STATE.currentIndex >= 0 && STATE.currentIndex < STATE.queue.length) {
    playTrackAtIndex(STATE.currentIndex);
    return;
  }
  if (!elements.audio.src) return;

  const currentVol = (typeof STATE.currentVolume === 'number' && !isNaN(STATE.currentVolume)) ? STATE.currentVolume : 0.75;
  const shouldPlay = elements.audio.paused || !STATE.isPlaying;

  if (shouldPlay) {
    elements.audio.muted = false;
    elements.audio.volume = currentVol;
    ensureWebAudioActive();
    elements.audio.play().then(() => {
      STATE.isPlaying = true;
      updatePlayPauseUI(true);
    }).catch(e => {
      console.warn('[Audio] play error:', e);
      STATE.isPlaying = false;
      updatePlayPauseUI(false);
    });
    STATE.isPlaying = true;
    updatePlayPauseUI(true);
  } else {
    elements.audio.pause();
    STATE.isPlaying = false;
    updatePlayPauseUI(false);
  }
}

function playNextTrack() {
  playHapticSfx('click');
  if (sleepEndTime === 'end') {
    sleepEndTime = null;
    STATE.sleepTimerMode = '0';
    if (elements.audio) elements.audio.pause();
    STATE.isPlaying = false;
    updatePlayPauseUI(false);
    updateSleepTimerBadge();
    document.querySelectorAll('.sleep-pill').forEach(p => p.classList.toggle('active', p.dataset.time === '0'));
    showToast('Sleep timer: Playback ended at song completion 🌙', 'bedtime', 3000);
    return;
  }
  if (STATE.queue.length === 0) return;

  if (STATE.isShuffle) {
    const randomIndex = Math.floor(Math.random() * STATE.queue.length);
    playTrackAtIndex(randomIndex);
    return;
  }

  let nextIndex = STATE.currentIndex + 1;
  if (nextIndex >= STATE.queue.length) {
    if (STATE.isRepeat) {
      nextIndex = 0;
    } else {
      return;
    }
  }
  playTrackAtIndex(nextIndex);
}

function playPrevTrack() {
  playHapticSfx('click');
  if (STATE.queue.length === 0) return;
  if (elements.audio.currentTime > 4) {
    elements.audio.currentTime = 0;
    return;
  }
  let prevIndex = STATE.currentIndex - 1;
  if (prevIndex < 0) prevIndex = STATE.queue.length - 1;
  playTrackAtIndex(prevIndex);
}

function updateMediaSession(song) {
  if (!song) return;

  const rawThumb = song.thumbnail || (elements.playerCoverArt ? elements.playerCoverArt.src : null) || 'icon.jpg';
  const artworkList = [];
  const sizes = [96, 128, 192, 256, 384, 512];
  for (const s of sizes) {
    artworkList.push({
      src: rawThumb,
      sizes: `${s}x${s}`,
      type: 'image/jpeg'
    });
  }

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title || 'PixelBeats Track',
        artist: song.artist || 'Unknown Artist',
        album: song.album || 'PixelBeats',
        artwork: artworkList
      });

      navigator.mediaSession.playbackState = STATE.isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime != null && elements.audio && !isNaN(elements.audio.duration)) {
          elements.audio.currentTime = details.seekTime;
          updateMediaSessionPositionState();
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (elements.audio) {
          elements.audio.currentTime = Math.max(0, elements.audio.currentTime - skipTime);
          updateMediaSessionPositionState();
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        if (elements.audio && !isNaN(elements.audio.duration)) {
          elements.audio.currentTime = Math.min(elements.audio.duration, elements.audio.currentTime + skipTime);
          updateMediaSessionPositionState();
        }
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        if (elements.audio) elements.audio.pause();
        STATE.isPlaying = false;
        updatePlayPauseUI(false);
      });
    } catch (e) {
      console.warn('[MediaSession] Metadata registration notice:', e);
    }
  }

  // Native Android MediaSession with Spotify-style Notification & Live Scrubber
  if (ArchiveTuneBridge.isNative()) {
    const curTime = (elements.audio && !isNaN(elements.audio.currentTime)) ? elements.audio.currentTime : 0;
    const durTime = (elements.audio && !isNaN(elements.audio.duration)) ? elements.audio.duration : parseDurationToSeconds(song.duration);
    ArchiveTuneBridge.updateMediaSession({
      title: song.title || 'PixelBeats Track',
      artist: song.artist || 'Unknown Artist',
      album: song.album || 'PixelBeats',
      duration: durTime,
      position: curTime,
      isPlaying: STATE.isPlaying,
      thumbnail: rawThumb
    });
  }

  updateMediaSessionPositionState();
}

function updateMediaSessionPositionState() {
  if (elements.audio && !isNaN(elements.audio.duration) && elements.audio.duration > 0) {
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
      try {
        navigator.mediaSession.setPositionState({
          duration: elements.audio.duration,
          playbackRate: elements.audio.playbackRate || 1.0,
          position: Math.min(elements.audio.currentTime || 0, elements.audio.duration)
        });
      } catch (e) {}
    }

    if (ArchiveTuneBridge.isNative()) {
      ArchiveTuneBridge.updatePlaybackState({
        isPlaying: STATE.isPlaying,
        position: elements.audio.currentTime || 0,
        duration: elements.audio.duration
      });
    }
  }
}

function addToQueue(song, playImmediately = false) {
  if (playImmediately) {
    playSongWithAutoQueue(song);
    return;
  }

  // Insert track directly as the NEXT song to play if playback is active
  if (STATE.currentIndex >= 0 && STATE.currentIndex < STATE.queue.length) {
    STATE.queue.splice(STATE.currentIndex + 1, 0, song);
  } else {
    STATE.queue.push(song);
  }
  updateQueueBadges();
  renderQueueList();

  if (STATE.currentIndex === -1) {
    playTrackAtIndex(0);
  }
}

function removeFromQueue(index, e) {
  if (e) e.stopPropagation();
  playHapticSfx('click');
  if (index === STATE.currentIndex) {
    elements.audio.pause();
    STATE.isPlaying = false;
    updatePlayPauseUI(false);
  }
  STATE.queue.splice(index, 1);
  if (index < STATE.currentIndex) {
    STATE.currentIndex--;
  } else if (index === STATE.currentIndex) {
    if (STATE.queue.length > 0) {
      playTrackAtIndex(Math.min(index, STATE.queue.length - 1));
    } else {
      STATE.currentIndex = -1;
      resetPlayerUI();
    }
  }
  updateQueueBadges();
  renderQueueList();
}

function resetPlayerUI() {
  if (elements.trackTitle) elements.trackTitle.textContent = 'Ready to Play';
  if (elements.trackArtist) elements.trackArtist.textContent = 'Select a song to start listening';
  if (elements.timeCurrent) elements.timeCurrent.textContent = '00:00';
  if (elements.timeDuration) elements.timeDuration.textContent = '00:00';
  if (elements.seekSlider) elements.seekSlider.value = 0;
  const scrubberFill = elements.scrubberFill || document.getElementById('scrubber-fill') || document.querySelector('.scrubber-fill-olive');
  if (scrubberFill) {
    scrubberFill.style.setProperty('width', '0px', 'important');
    scrubberFill.style.setProperty('display', 'none', 'important');
  }
  if (elements.scrubberThumb) elements.scrubberThumb.style.left = '0%';
  if (elements.playerCoverArt) elements.playerCoverArt.src = 'idle-cover.jpg';
  if (elements.miniThumb) elements.miniThumb.src = 'idle-cover.jpg';
}

function updateQueueBadges() {
  const count = STATE.queue.length;
  if (elements.queueCount) elements.queueCount.textContent = `Up Next (${count})`;
}

function renderQueueList() {
  if (!elements.queueList) return;
  if (STATE.queue.length === 0) {
    elements.queueList.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">queue_music</span>
        <h3>Queue is Empty</h3>
        <p>Search for tracks or albums and add them to your queue!</p>
      </div>
    `;
    return;
  }

  elements.queueList.innerHTML = '';
  STATE.queue.forEach((song, idx) => {
    const isCurrent = idx === STATE.currentIndex;
    const thumbUrl = song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
    const item = document.createElement('div');
    item.className = `queue-item stagger-item ${isCurrent ? 'playing' : ''}`;
    item.style.setProperty('--item-index', idx);

    if (isCurrent) {
      item.innerHTML = `
        <img src="${thumbUrl}" class="queue-thumb" alt="Cover" onerror="this.src='icon.jpg'">
        <div class="queue-details">
          <div class="queue-title">${escapeHtml(song.title)}</div>
          <div class="queue-artist">${escapeHtml(song.artist)} • ${song.duration || '--:--'}</div>
        </div>
        <div class="queue-actions-row">
          <button class="queue-btn-action queue-btn-remove" title="Remove"><span class="material-symbols-rounded">close</span></button>
        </div>
      `;
    } else {
      item.innerHTML = `
        <img src="${thumbUrl}" class="queue-thumb" alt="Cover" onerror="this.src='icon.jpg'">
        <div class="queue-details">
          <div class="queue-title">${escapeHtml(song.title)}</div>
          <div class="queue-artist">#${idx + 1} • ${escapeHtml(song.artist)} • ${song.duration || '--:--'}</div>
        </div>
        <div class="queue-actions-row">
          <button class="queue-btn-action queue-btn-top" title="Play Next / Move to Top"><span class="material-symbols-rounded">vertical_align_top</span></button>
          <button class="queue-btn-action queue-btn-remove" title="Remove"><span class="material-symbols-rounded">close</span></button>
        </div>
      `;
    }

    item.addEventListener('pointerenter', () => prefetchTrackAudioAndLyrics(song), { passive: true, once: true });
    item.addEventListener('pointerdown', () => prefetchTrackAudioAndLyrics(song), { passive: true, once: true });

    item.addEventListener('click', (e) => {
      if (e.target.closest('.queue-btn-action')) return;
      playHapticSfx('click');
      prefetchTrackAudioAndLyrics(song);
      switchTab('tab-player');
      playTrackAtIndex(idx);
      renderQueueList();
      syncMiniPlayer();
    });

    const btnTop = item.querySelector('.queue-btn-top');
    if (btnTop) {
      btnTop.addEventListener('click', (e) => {
        e.stopPropagation();
        moveQueueTrackToNext(idx);
      });
    }

    const btnRemove = item.querySelector('.queue-btn-remove');
    if (btnRemove) {
      btnRemove.addEventListener('click', (e) => {
        removeFromQueue(idx, e);
      });
    }

    elements.queueList.appendChild(item);
  });
}

function moveQueueTrackToNext(idx) {
  playHapticSfx('click');
  const targetIdx = (STATE.currentIndex >= 0 && STATE.currentIndex < idx) ? STATE.currentIndex + 1 : 0;
  if (idx === targetIdx) return;
  const item = STATE.queue.splice(idx, 1)[0];
  STATE.queue.splice(targetIdx, 0, item);
  renderQueueList();
  showToast('Moved to play next', 'arrow_upward');
}

function renderSearchResults(songs, headerTitle = null) {
  STATE.lastSearchResults = songs || [];
  elements.searchSpinner.classList.add('hidden');
  if (!songs || songs.length === 0) {
    elements.searchResults.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-rounded empty-icon">music_off</span>
        <h3>No Songs Found</h3>
        <p>Try searching for a different song or artist</p>
      </div>
    `;
    return;
  }

  // INSTANT AUDIO PRE-FETCHING: Pre-fetch stream & parallel lyrics for top search results
  if (songs[0]) prefetchTrackAudioAndLyrics(songs[0]);
  if (songs[1]) prefetchTrackAudioAndLyrics(songs[1]);

  elements.searchResults.innerHTML = '';
  if (headerTitle) {
    const hdr = document.createElement('div');
    hdr.className = 'trending-header';
    hdr.innerHTML = `<span class="material-symbols-rounded">trending_up</span><span>${escapeHtml(headerTitle)}</span>`;
    elements.searchResults.appendChild(hdr);
  }

  songs.forEach((song, index) => {
    const card = document.createElement('div');
    const isCurrent = STATE.currentIndex >= 0 && STATE.queue[STATE.currentIndex] && STATE.queue[STATE.currentIndex].videoId === song.videoId;
    card.className = `song-card stagger-item ${isCurrent ? 'playing' : ''}`;
    card.style.setProperty('--item-index', index);
    const thumbUrl = song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`;
    card.innerHTML = `
      <img src="${thumbUrl}" class="song-thumb" alt="Cover" onerror="this.src='icon.jpg'">
      <div class="song-info">
        <div class="song-title">
          ${escapeHtml(song.title)}
        </div>
        <div class="song-meta">
          <span>${escapeHtml(song.artist)} • ${song.duration || '--:--'}</span>
        </div>
      </div>
      <div class="song-actions">
        <button class="song-action-btn btn-add-queue" title="Add to Queue"><span class="material-symbols-rounded">add</span></button>
        <button class="song-action-btn btn-dl-card" title="Save to Vault"><span class="material-symbols-rounded">download</span></button>
      </div>
    `;

    // Instant prefetch on touch or hover
    card.addEventListener('pointerenter', () => prefetchTrackAudioAndLyrics(song), { passive: true, once: true });
    card.addEventListener('pointerdown', () => prefetchTrackAudioAndLyrics(song), { passive: true, once: true });

    card.querySelector('.btn-add-queue').addEventListener('click', (e) => {
      e.stopPropagation();
      playHapticSfx('click');
      addToQueue(song, false);
      showToast('Added to queue', 'queue_music');
    });

    const dlBtn = card.querySelector('.btn-dl-card');
    dlBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      playHapticSfx('click');
      await downloadSongToVault(song);
      const isSaved = await OfflineVault.getTrack(song.videoId);
      if (isSaved) {
        dlBtn.querySelector('.material-symbols-rounded').textContent = 'check';
        dlBtn.style.background = '#EFF2E1';
        dlBtn.style.color = '#363D17';
      }
    });

    OfflineVault.getTrack(song.videoId).then(saved => {
      if (saved) {
        const icon = dlBtn.querySelector('.material-symbols-rounded');
        if (icon) icon.textContent = 'check';
        dlBtn.style.background = '#EFF2E1';
        dlBtn.style.color = '#363D17';
      }
    }).catch(() => {});

    card.addEventListener('click', () => {
      playHapticSfx('play');
      prefetchTrackAudioAndLyrics(song);
      playSongWithAutoQueue(song);
      document.querySelectorAll('.song-card.playing').forEach(c => c.classList.remove('playing'));
      card.classList.add('playing');
      syncMiniPlayer();
    });

    elements.searchResults.appendChild(card);
  });
}

async function playSongWithAutoQueue(song) {
  if (!song) return;

  // 1. Immediately abort any in-flight recommendations/cycle fetches from prior songs
  if (queueAbortController) {
    try { queueAbortController.abort(); } catch (e) {}
  }
  queueAbortController = new AbortController();
  const session = ++activeQueueSessionId;
  currentAutoQueueRootVideoId = song.videoId;
  isFetchingSimilar = false;

  // 2. Prefetch incoming audio stream & lyrics
  prefetchTrackAudioAndLyrics(song);

  // 3. Completely remove the old queue and restart fresh from first (index 0)
  STATE.queue = [song];
  STATE.currentIndex = 0;
  updateQueueBadges();
  renderQueueList();

  // 4. Start playback immediately from the first track
  playTrackAtIndex(0);
  syncMiniPlayer();

  // 5. Load the queue of same type songs again for this newly selected music
  if (song.videoId) {
    try {
      let recs = [];
      const signal = queueAbortController.signal;

      // Primary: Native ArchiveTune YouTube Music Radio Queue (100% on-device!)
      if (ArchiveTuneBridge.isNative()) {
        try {
          const nativeRecs = await ArchiveTuneBridge.getNextQueue(song.videoId);
          if (nativeRecs && nativeRecs.length > 0) {
            recs = nativeRecs;
          }
        } catch (e) {
          console.warn('[AutoQueue] ArchiveTune native next queue notice:', e);
        }
      }

      // Secondary: Python backend recommendations (if configured)
      if ((!recs || recs.length === 0) && STATE.isBackendAlive) {
        try {
          const resp = await fetch(`${STATE.backendUrl}/api/recommendations?videoId=${encodeURIComponent(song.videoId)}&artist=${encodeURIComponent(song.artist || '')}`, { signal });
          if (resp.ok) {
            recs = await resp.json();
          }
        } catch (e) {
          if (e.name === 'AbortError') return;
          console.warn('[AutoQueue] Backend recommendations error:', e);
        }
      }

      // Tertiary: Public mirror fallback
      if ((!recs || recs.length === 0) && STATE.autoFallback) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const pipedUrl = `${getPipedBaseUrl()}/streams/${song.videoId}`;
            const resp = await fetch(pipedUrl, { signal });
            if (resp.ok) {
              const data = await resp.json();
              const related = data.relatedStreams || [];
              recs = related.map(r => ({
                videoId: (r.url || '').replace('/watch?v=', ''),
                title: r.title || 'Unknown Title',
                artist: r.uploaderName || 'Unknown Artist',
                album: 'Single',
                duration: formatSecondsToTime(r.duration || 0),
                thumbnail: r.thumbnail || `https://i.ytimg.com/vi/${(r.url || '').replace('/watch?v=', '')}/hqdefault.jpg`
              })).filter(t => t.videoId);
              if (recs.length > 0) break;
            }
          } catch (e) {
            if (e.name === 'AbortError') return;
            rotatePipedInstance();
          }
        }
      }

      // Guard check: Discard if user already selected another song in search
      if (session !== activeQueueSessionId || signal.aborted) return;
      if (!STATE.queue[0] || STATE.queue[0].videoId !== song.videoId) return;

      if (recs && recs.length > 0) {
        const curIds = new Set(STATE.queue.map(s => s.videoId));
        const newTracks = recs.filter(r => r.videoId && !curIds.has(r.videoId));
        if (newTracks.length > 0) {
          newTracks.slice(0, 15).forEach(t => STATE.queue.push(t));
          updateQueueBadges();
          renderQueueList();
          showToast(`Loaded ${Math.min(newTracks.length, 15)} similar tracks to Up Next`, 'queue_music');
          prefetchNextSong();
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn('[AutoQueue] Error loading fresh recommendations:', err);
    } finally {
      if (session === activeQueueSessionId) {
        currentAutoQueueRootVideoId = null;
      }
    }
  }
}

async function loadTrendingTracks() {
  if (!elements.searchResults) return;

  // If no tracks currently rendered, show subtle spinner without clearing anything
  const hasExistingTracks = elements.searchResults.children.length > 0;
  if (!hasExistingTracks) {
    elements.searchSpinner.classList.remove('hidden');
  }

  try {
    let songs = [];

    // 1. Native ArchiveTune on-device discovery
    if (ArchiveTuneBridge.isNative()) {
      try {
        const nativeTracks = await ArchiveTuneBridge.search("Top Hits 2026");
        if (nativeTracks && nativeTracks.length > 0) {
          songs = nativeTracks;
        }
      } catch (e) {}
    }

    // 2. Optional remote proxy
    if ((!songs || songs.length === 0) && STATE.backendUrl && STATE.isBackendAlive) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const resp = await fetch(`${STATE.backendUrl}/api/trending`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (resp.ok) {
          songs = await resp.json();
          STATE.isBackendAlive = true;
        }
      } catch (e) {
        console.warn('[Trending] /api/trending notice:', e.message);
      }
    }

    if (!songs || songs.length === 0) {
      const cached = localStorage.getItem('pixelbeats_cached_trending');
      if (cached) {
        try { songs = JSON.parse(cached); } catch (e) {}
      }
    }

    if (!songs || songs.length === 0) {
      songs = SEED_TRENDING_TRACKS;
    }

    STATE.trendingTracks = songs || [];
    localStorage.setItem('pixelbeats_cached_trending', JSON.stringify(STATE.trendingTracks));

    // Only update search results if user is not actively searching
    if (!elements.searchInput || !elements.searchInput.value.trim()) {
      renderSearchResults(STATE.trendingTracks, 'Trending & Handpicked');
    }

    if (STATE.trendingTracks && STATE.trendingTracks.length > 0) {
      prefetchTrackAudioAndLyrics(STATE.trendingTracks[0]);
    }
  } catch (err) {
    console.warn('[Trending] Notice loading tracks:', err);
    if (!hasExistingTracks) {
      renderSearchResults(SEED_TRENDING_TRACKS, 'Trending & Handpicked');
    }
  } finally {
    elements.searchSpinner.classList.add('hidden');
  }
}

async function loadPlaylistFromUrl(url) {
  if (!url || !url.trim()) return;
  elements.searchSpinner.classList.remove('hidden');
  elements.searchResults.innerHTML = '';

  try {
    if (STATE.isBackendAlive) {
      const resp = await fetch(`${STATE.backendUrl}/api/playlist?url=${encodeURIComponent(url.trim())}`);
      if (resp.ok) {
        const data = await resp.json();
        const tracks = data.tracks || [];
        if (tracks.length > 0) {
          tracks.forEach(t => addToQueue(t, false));
          showToast(`Imported ${tracks.length} tracks`, 'playlist_play');
          switchTab('tab-queue');
          return;
        }
      }
    }
    showToast('Playlist extraction failed', 'error');
  } catch (err) {
    showToast(`Import Error: ${err.message}`, 'error');
  } finally {
    elements.searchSpinner.classList.add('hidden');
  }
}

// ================= NAVIGATION & TAB SWITCHING =================
const TAB_ORDER = ['tab-player', 'tab-search', 'tab-library', 'tab-queue', 'tab-settings'];

function switchTab(tabId) {
  playHapticSfx('click');
  // Normalize config tab references
  const targetId = (tabId === 'config' || tabId === 'tab-config' || tabId === 'config-view') ? 'tab-settings' : tabId;
  const previousTabId = STATE.activeTab || 'tab-player';

  if (previousTabId === targetId && document.getElementById(targetId)?.classList.contains('active')) {
    positionNavIndicator(false);
    return;
  }
  STATE.activeTab = targetId;

  const prevIdx = TAB_ORDER.indexOf(previousTabId);
  const nextIdx = TAB_ORDER.indexOf(targetId);
  const slideDirection = (prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx) ? 'left' : 'right';

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active', 'initial-load', 'slide-from-right', 'slide-from-left');
  });

  const target = document.getElementById(targetId) || document.querySelector(`[data-view="${tabId}"]`);
  if (target) {
    target.classList.add('active');
    target.classList.add(slideDirection === 'left' ? 'slide-from-left' : 'slide-from-right');
  }

  // Maintain consistent main viewport shell background: #363D17
  const shell = document.querySelector('.pixel-shell');
  if (shell) {
    shell.style.setProperty('background', '#363D17', 'important');
    shell.style.setProperty('background-color', '#363D17', 'important');
  }

  document.querySelectorAll('.m3-nav-item').forEach(btn => {
    if (btn.dataset.tab === targetId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (targetId === 'tab-library') {
    switchLibraryView(STATE.activeLibView);
  }

  enforceSliderStyles();
  positionNavIndicator(true);
  syncMiniPlayer();
}

function syncMiniPlayer() {
  if (!elements.floatingMiniPlayer) return;
  if (STATE.currentIndex >= 0 && STATE.currentIndex < STATE.queue.length && STATE.activeTab !== 'tab-player') {
    const song = STATE.queue[STATE.currentIndex];
    if (elements.miniTitle) elements.miniTitle.textContent = song.title || 'Playing';
    if (elements.miniArtist) elements.miniArtist.textContent = song.artist || 'Unknown Artist';
    if (elements.miniThumb) {
      elements.miniThumb.src = song.thumbnail || (elements.playerCoverArt ? elements.playerCoverArt.src : 'icon.jpg');
    }
    if (elements.miniPlayIcon) {
      elements.miniPlayIcon.textContent = STATE.isPlaying ? 'pause' : 'play_arrow';
    }
    elements.floatingMiniPlayer.classList.remove('hidden');
  } else {
    elements.floatingMiniPlayer.classList.add('hidden');
  }
}

// Google Pixel Material 3 Split-Track Volume Pill Engine
let lastNonZeroVol = 0.75;

function updateVolumeVisuals(percent) {
  if (percent > 1) percent = percent / 100;
  percent = Math.max(0, Math.min(1, percent));

  STATE.currentVolume = percent;
  try {
    localStorage.setItem('pixelbeats_volume', percent.toString());
  } catch (_) {}

  const audioPlayer = elements.audio;
  if (audioPlayer) {
    audioPlayer.volume = percent;
  }

  const volFillBar = document.getElementById('vol-fill-bar') || elements.volFillOlive;
  const volEmptyBar = document.getElementById('vol-empty-bar') || elements.volEmptyCream;
  const volDivider = document.getElementById('vol-divider');

  if (volEmptyBar) {
    const noteIcon = volEmptyBar.querySelector('.material-symbols-rounded, span');
    if (noteIcon) noteIcon.remove();
  }

  if (percent >= 0.99) {
    if (volFillBar) {
      volFillBar.style.setProperty('display', 'block', 'important');
      volFillBar.style.setProperty('width', 'calc(100% - 10px)', 'important');
      volFillBar.style.setProperty('border-radius', '16px 16px 16px 16px', 'important');
    }
    if (volEmptyBar) {
      volEmptyBar.style.setProperty('display', 'none', 'important');
      volEmptyBar.style.setProperty('width', '0px', 'important');
    }
    if (volDivider) {
      volDivider.style.setProperty('display', 'block', 'important');
    }
  } else if (percent <= 0.01) {
    if (volFillBar) {
      volFillBar.style.setProperty('display', 'none', 'important');
      volFillBar.style.setProperty('width', '0px', 'important');
    }
    if (volEmptyBar) {
      volEmptyBar.style.setProperty('display', 'block', 'important');
      volEmptyBar.style.setProperty('width', 'calc(100% - 10px)', 'important');
      volEmptyBar.style.setProperty('flex', '1', 'important');
      volEmptyBar.style.setProperty('border-radius', '16px 16px 16px 16px', 'important');
    }
    if (volDivider) {
      volDivider.style.setProperty('display', 'block', 'important');
    }
  } else {
    if (volFillBar) {
      volFillBar.style.setProperty('display', 'block', 'important');
      volFillBar.style.setProperty('width', `calc(${percent * 100}% - 5px)`, 'important');
      volFillBar.style.setProperty('border-radius', '16px 4px 4px 16px', 'important');
    }
    if (volEmptyBar) {
      volEmptyBar.style.setProperty('display', 'block', 'important');
      volEmptyBar.style.removeProperty('width');
      volEmptyBar.style.setProperty('flex', '1', 'important');
      volEmptyBar.style.setProperty('border-radius', '4px 16px 16px 4px', 'important');
    }
    if (volDivider) {
      volDivider.style.setProperty('display', 'block', 'important');
    }
  }

  const volSlider = document.getElementById('vol-slider') || elements.volSlider;
  if (volSlider) {
    volSlider.value = Math.round(percent * 100);
  }
}

function initSplitTrackVolumePill() {
  const volTrackArea = document.getElementById('vol-track-area') || elements.volSplitTrack;
  const volFillBar = document.getElementById('vol-fill-bar') || elements.volFillOlive;
  const volMuteBtn = document.getElementById('vol-mute-btn') || elements.volCircleBtn;
  const volModeIcon = document.getElementById('vol-mode-icon') || elements.volCircleIcon;
  const volLyricsBtn = document.getElementById('vol-lyrics-btn') || elements.volSquareBtn;
  const volEqBtn = document.getElementById('vol-eq-btn');
  const audioPlayer = elements.audio;

  // Set initial volume from persistent state matching the user's saved preference
  const savedVol = parseFloat(localStorage.getItem('pixelbeats_volume') || '0.75');
  STATE.currentVolume = (typeof savedVol === 'number' && !isNaN(savedVol)) ? savedVol : 0.75;
  if (audioPlayer) {
    audioPlayer.volume = STATE.currentVolume;
  }
  updateVolumeVisuals(STATE.currentVolume);

  // Pointer drag & click logic on #vol-track-area
  if (volTrackArea) {
    let isDraggingVol = false;

    const updateVolumeFromPointer = (e) => {
      const rect = volTrackArea.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left);
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

      if (audioPlayer && audioPlayer.muted && percent > 0) {
        audioPlayer.muted = false;
      }

      updateVolumeVisuals(percent);

      if (percent > 0) {
        lastNonZeroVol = percent;
      }
    };

    volTrackArea.addEventListener('pointerdown', (e) => {
      isDraggingVol = true;
      try { volTrackArea.setPointerCapture(e.pointerId); } catch (_) {}
      updateVolumeFromPointer(e);
    });

    volTrackArea.addEventListener('pointermove', (e) => {
      if (isDraggingVol) {
        updateVolumeFromPointer(e);
      }
    });

    const endVolDrag = (e) => {
      if (isDraggingVol) {
        isDraggingVol = false;
        try { volTrackArea.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    volTrackArea.addEventListener('pointerup', endVolDrag);
    volTrackArea.addEventListener('pointercancel', endVolDrag);

    // Touch event listeners for silky smooth drag on Android & mobile
    volTrackArea.addEventListener('touchstart', (e) => {
      isDraggingVol = true;
      updateVolumeFromPointer(e);
    }, { passive: true });

    volTrackArea.addEventListener('touchmove', (e) => {
      if (isDraggingVol) {
        updateVolumeFromPointer(e);
      }
    }, { passive: true });

    volTrackArea.addEventListener('touchend', endVolDrag);
    volTrackArea.addEventListener('touchcancel', endVolDrag);
  }

  // Instant Favorite Heart on #vol-mute-btn
  if (volMuteBtn) {
    volMuteBtn.addEventListener('click', () => {
      toggleFavoriteCurrentTrack();
    });
  }
  updateFavoriteButtonState();

  // Toggle Lyrics on #vol-lyrics-btn
  if (volLyricsBtn) {
    volLyricsBtn.addEventListener('click', () => {
      playHapticSfx('click');
      toggleLyricsMode();
    });
  }

  // Switch to Config Tab on #vol-eq-btn
  if (volEqBtn) {
    volEqBtn.addEventListener('click', () => {
      playHapticSfx('click');
      switchTab('config');
    });
  }

  // Enforce high-contrast styles on volume pill elements
  enforceSliderStyles();
}

// Global Material 3 Ripple Micro-Interaction
function initGlobalRipple() {
  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest(
      '.m3-icon-btn, .m3-pill-btn, .m3-hero-play-btn, .bento-widget-btn, .m3-accent-pill-btn, .m3-tonal-pill-btn, .m3-danger-pill-btn, .m3-segment-btn, .m3-filter-chip, .song-card, .album-card, .playlist-card, .theme-card-option, .mini-action-btn'
    );
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'm3-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    const clientX = e.clientX !== undefined ? e.clientX : rect.left + rect.width / 2;
    const clientY = e.clientY !== undefined ? e.clientY : rect.top + rect.height / 2;
    ripple.style.left = `${clientX - rect.left - size / 2}px`;
    ripple.style.top = `${clientY - rect.top - size / 2}px`;

    target.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 650);
  });
}

function switchLibraryView(view) {
  STATE.activeLibView = view;
  if (elements.libNavOffline) elements.libNavOffline.classList.toggle('active', view === 'offline');
  if (elements.libNavPlaylists) elements.libNavPlaylists.classList.toggle('active', view === 'playlists');
  if (elements.libNavAlbums) elements.libNavAlbums.classList.toggle('active', view === 'albums');

  if (elements.libViewOffline) elements.libViewOffline.classList.toggle('hidden', view !== 'offline');
  if (elements.libViewPlaylists) elements.libViewPlaylists.classList.toggle('hidden', view !== 'playlists');
  if (elements.libViewAlbums) elements.libViewAlbums.classList.toggle('hidden', view !== 'albums');

  if (view === 'offline') {
    updateVaultUI();
  } else if (view === 'playlists') {
    renderPlaylistsGrid();
  } else if (view === 'albums') {
    renderLibraryAlbums();
  }
}

function formatSecondsToTime(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Bottom Navigation Bar
  document.querySelectorAll('.m3-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.getAttribute('data-tab') || btn.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  // Media Controls
  elements.btnPlay.addEventListener('click', togglePlayPause);
  elements.btnNext.addEventListener('click', playNextTrack);
  elements.btnPrev.addEventListener('click', playPrevTrack);

  elements.btnShuffle.addEventListener('click', () => {
    playHapticSfx('click');
    STATE.isShuffle = !STATE.isShuffle;
    elements.btnShuffle.classList.toggle('active', STATE.isShuffle);
    enforceSliderStyles();
    showToast(`Shuffle: ${STATE.isShuffle ? 'On' : 'Off'}`, 'shuffle');
  });

  elements.btnRepeat.addEventListener('click', () => {
    playHapticSfx('click');
    STATE.isRepeat = !STATE.isRepeat;
    elements.btnRepeat.classList.toggle('active', STATE.isRepeat);
    enforceSliderStyles();
    showToast(`Repeat: ${STATE.isRepeat ? 'On' : 'Off'}`, 'repeat');
  });

  // Save Track to Vault
  elements.btnDownloadTrack.addEventListener('click', () => {
    if (STATE.currentIndex >= 0 && STATE.currentIndex < STATE.queue.length) {
      const cur = STATE.queue[STATE.currentIndex];
      downloadSongToVault(cur);
    } else {
      showToast('Play a song first to save to vault', 'info');
    }
  });

  // Add Current Track to Playlist
  elements.btnPlayerAddPlaylist.addEventListener('click', () => {
    if (STATE.currentIndex >= 0 && STATE.currentIndex < STATE.queue.length) {
      const cur = STATE.queue[STATE.currentIndex];
      openPlaylistPicker(cur);
    } else {
      showToast('Play a song first to add to playlist', 'info');
    }
  });

  // Lossless Audio Quality Badge Info
  const losslessBadge = document.getElementById('lossless-badge');
  if (losslessBadge) {
    losslessBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      playHapticSfx('click');
      showToast('Lossless • 24-bit / 48 kHz High-Fidelity Master Audio', 'graphic_eq', 2500);
    });
  }

  // Auto-Cycle
  if (elements.btnAutoCycle) {
    elements.btnAutoCycle.addEventListener('click', () => {
      playHapticSfx('click');
      STATE.isAutoCycle = !STATE.isAutoCycle;
      localStorage.setItem('pixelbeats_auto_cycle', STATE.isAutoCycle);
      elements.btnAutoCycle.classList.toggle('active', STATE.isAutoCycle);
      if (elements.autoCycleLabel) elements.autoCycleLabel.textContent = 'CYCLE';
      enforceSliderStyles();
      showToast(`Mood Cycle: ${STATE.isAutoCycle ? 'On' : 'Off'}`, 'sync');
      if (STATE.isAutoCycle && STATE.currentIndex >= 0) {
        const cur = STATE.queue[STATE.currentIndex];
        fetchAndAppendSimilarCycle(cur.videoId);
      }
    });
  }

  // HTML5 Audio Events & Buffering Watchdog
  let audioStallRecoveryTimer = null;

  elements.audio.addEventListener('waiting', () => {
    if (elements.sourceIndicator) {
      elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded animate-spin">progress_activity</span>BUFFERING...';
    }
    clearTimeout(audioStallRecoveryTimer);
    audioStallRecoveryTimer = setTimeout(() => {
      if (STATE.isPlaying && elements.audio && !elements.audio.paused) {
        console.warn('[Audio Watchdog] Buffering stalled > 3.5s, auto-resuming...');
        const ct = elements.audio.currentTime;
        elements.audio.currentTime = Math.max(0, ct - 0.1);
        elements.audio.play().catch(() => {});
      }
    }, 3500);
  });

  elements.audio.addEventListener('playing', () => {
    clearTimeout(audioStallRecoveryTimer);
    ensureWebAudioActive();
    STATE.isPlaying = true;
    updatePlayPauseUI(true);
    if (elements.sourceIndicator) {
      const isVault = elements.audio.src.startsWith('blob:');
      elements.sourceIndicator.innerHTML = isVault ?
        '<span class="material-symbols-rounded">cloud_done</span>OFFLINE VAULT' :
        '<span class="material-symbols-rounded">cell_tower</span>STREAM HD';
    }
  });

  elements.audio.addEventListener('canplay', () => {
    clearTimeout(audioStallRecoveryTimer);
    if (STATE.isPlaying && elements.audio.paused) {
      elements.audio.play().catch(() => {});
    }
  });

  elements.audio.addEventListener('stalled', () => {
    console.warn('[Audio] Stream download stalled over network');
    if (elements.sourceIndicator && STATE.isPlaying) {
      elements.sourceIndicator.innerHTML = '<span class="material-symbols-rounded">sync_problem</span>RECONNECTING...';
    }
  });

  let lastMediaSessionPositionUpdate = 0;
  elements.audio.addEventListener('timeupdate', () => {
    const cur = elements.audio.currentTime || 0;
    const dur = elements.audio.duration || 0;
    if (elements.timeCurrent && !isUserScrubbing) {
      elements.timeCurrent.textContent = formatSecondsToTime(cur);
    }
    if (dur > 0 && elements.timeDuration) {
      elements.timeDuration.textContent = formatSecondsToTime(dur);
    }
    updateScrubberUI(cur, dur);
    if (!document.hidden && STATE.lyricsMode) {
      syncLyricsWithTime(cur);
    }
    if (sleepEndTime && sleepEndTime !== 'end') {
      checkSleepTimerTick();
    }
    const curSong = STATE.queue[STATE.currentIndex];
    const knownSec = curSong ? parseDurationToSeconds(curSong.duration) : 0;
    const effectiveDur = (dur > 0 && isFinite(dur)) ? dur : knownSec;

    if (sleepEndTime === 'end' && effectiveDur > 0 && cur >= (effectiveDur - 0.8)) {
      console.log('[Sleep Timer] End of song reached via timeupdate!');
      sleepEndTime = null;
      STATE.sleepTimerMode = '0';
      if (elements.audio) {
        elements.audio.pause();
      }
      STATE.isPlaying = false;
      updatePlayPauseUI(false);
      updateSleepTimerBadge();
      document.querySelectorAll('.sleep-pill').forEach(p => p.classList.toggle('active', p.dataset.time === '0'));
      showToast('Sleep timer: Playback ended at song completion 🌙', 'bedtime', 3000);
      return;
    }
    // Throttle MediaSession position updates to once every 4 seconds to avoid IPC churn in background
    const now = Date.now();
    if (now - lastMediaSessionPositionUpdate > 4000) {
      lastMediaSessionPositionUpdate = now;
      updateMediaSessionPositionState();
    }
  });

  elements.audio.addEventListener('seeked', () => {
    isUserScrollingLyrics = false;
    clearTimeout(userScrollTimer);
    const cur = elements.audio.currentTime || 0;
    syncLyricsWithTime(cur, true);
    updateScrubberUI(cur, elements.audio.duration || 0);
  });

  elements.audio.addEventListener('loadedmetadata', () => {
    const curSong = STATE.queue[STATE.currentIndex];
    const dur = elements.audio.duration || 0;
    if (dur > 0 && curSong) {
      const knownSec = parseDurationToSeconds(curSong.duration);
      if (!knownSec || Math.abs(knownSec - dur) > 6) {
        curSong.duration = formatSecondsToTime(dur);
        if (elements.timeDuration) elements.timeDuration.textContent = curSong.duration;
        fetchLyricsForSong(curSong).then(lyrics => {
          if (STATE.lyricsLoadedForSongId === curSong.videoId && STATE.lyricsMode) {
            renderLyricsList();
            syncLyricsWithTime(elements.audio.currentTime || 0, true);
          }
        });
      }
    }
  });

  elements.audio.addEventListener('ended', () => {
    if (sleepEndTime === 'end') {
      sleepEndTime = null;
      STATE.sleepTimerMode = '0';
      updateSleepTimerBadge();
      document.querySelectorAll('.sleep-pill').forEach(p => p.classList.toggle('active', p.dataset.time === '0'));
      elements.audio.pause();
      STATE.isPlaying = false;
      updatePlayPauseUI(false);
      showToast('Sleep timer: Playback ended at song completion', 'bedtime');
      return;
    }
    playNextTrack();
  });

  elements.audio.addEventListener('error', (e) => {
    console.warn('[Audio] HTML5 audio error event triggered:', elements.audio.src, e);
    const curSrc = elements.audio.src;
    if (STATE.backendUrl && curSrc && !curSrc.includes('/api/proxy') && !curSrc.startsWith('blob:')) {
      console.log('[Audio] Retrying playback through backend proxy...');
      elements.audio.src = `${STATE.backendUrl}/api/proxy?url=${encodeURIComponent(curSrc)}`;
      elements.audio.load();
      elements.audio.play().catch(err => console.warn('[Audio] Proxy play error:', err));
    }
  });

  // Material 3 Split-Track Volume Pill initialized via initSplitTrackVolumePill()

  // Search Mode Switch
  elements.btnSearchModeSongs.addEventListener('click', () => {
    playHapticSfx('click');
    STATE.searchMode = 'songs';
    elements.btnSearchModeSongs.classList.add('active');
    elements.btnSearchModeAlbums.classList.remove('active');
    elements.searchInput.placeholder = 'Search songs, artists, or albums...';
  });

  elements.btnSearchModeAlbums.addEventListener('click', () => {
    playHapticSfx('click');
    STATE.searchMode = 'albums';
    elements.btnSearchModeAlbums.classList.add('active');
    elements.btnSearchModeSongs.classList.remove('active');
    elements.searchInput.placeholder = 'Search albums, records, soundtracks...';
  });

  // Search Input: Clear Button Visibility
  elements.searchInput.addEventListener('input', () => {
    if (elements.btnSearchClear) {
      elements.btnSearchClear.classList.toggle('hidden', elements.searchInput.value.trim().length === 0);
    }
  });

  // Search Clear Button Action
  if (elements.btnSearchClear) {
    elements.btnSearchClear.addEventListener('click', () => {
      playHapticSfx('click');
      elements.searchInput.value = '';
      elements.btnSearchClear.classList.add('hidden');
      elements.searchInput.focus();
      if (STATE.trendingTracks && STATE.trendingTracks.length > 0) {
        renderSearchResults(STATE.trendingTracks, 'Trending & Handpicked');
      } else {
        loadTrendingTracks();
      }
    });
  }

  // Search Action
  elements.btnSearch.addEventListener('click', async () => {
    playHapticSfx('click');
    const q = elements.searchInput.value;
    if (!q.trim()) {
      await loadTrendingTracks();
      return;
    }
    elements.searchSpinner.classList.remove('hidden');
    elements.searchResults.innerHTML = '';
    try {
      if (STATE.searchMode === 'albums') {
        const albums = await searchAlbums(q);
        renderAlbumResults(albums);
      } else {
        const songs = await searchSongs(q);
        STATE.searchResults = songs;
        renderSearchResults(songs, `Results for "${q}"`);
      }
    } catch (e) {
      elements.searchSpinner.classList.add('hidden');
      showToast(`Search error: ${e.message}`, 'error');
    }
  });

  elements.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') elements.btnSearch.click();
  });

  // Apple Music-Style Visual Browse Tiles
  document.querySelectorAll('.browse-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      playHapticSfx('click');
      const q = tile.dataset.query;
      if (!q) return;
      elements.searchInput.value = q;
      if (elements.btnSearchClear) elements.btnSearchClear.classList.remove('hidden');
      STATE.searchMode = 'songs';
      elements.btnSearchModeSongs.classList.add('active');
      elements.btnSearchModeAlbums.classList.remove('active');
      elements.btnSearch.click();
    });
  });

  // Playlist Import
  elements.btnImportPlaylist.addEventListener('click', () => {
    loadPlaylistFromUrl(elements.playlistInput.value);
  });

  // Library Navigation Pills
  elements.libNavOffline.addEventListener('click', () => switchLibraryView('offline'));
  elements.libNavPlaylists.addEventListener('click', () => switchLibraryView('playlists'));
  elements.libNavAlbums.addEventListener('click', () => switchLibraryView('albums'));

  // Vault Play All
  elements.btnVaultPlayAll.addEventListener('click', async () => {
    playHapticSfx('play');
    const tracks = await OfflineVault.getAllTracks();
    if (!tracks || tracks.length === 0) {
      showToast('No offline tracks in vault', 'info');
      return;
    }
    STATE.queue = [...tracks];
    updateQueueBadges();
    renderQueueList();
    playTrackAtIndex(0);
    showToast(`Playing all ${tracks.length} offline tracks`, 'cloud_done');
    syncMiniPlayer();
  });

  // Create Playlist Button
  elements.btnCreatePlaylist.addEventListener('click', () => {
    playHapticSfx('click');
    const name = prompt('Enter playlist name:');
    if (name) {
      const pl = PlaylistsManager.createPlaylist(name);
      if (pl) {
        showToast(`Created "${pl.name}"`, 'playlist_add');
        renderPlaylistsGrid();
      }
    }
  });

  // Picker Create Playlist
  elements.btnPickerCreateNew.addEventListener('click', () => {
    playHapticSfx('click');
    const name = prompt('Enter new playlist name:');
    if (name) {
      const pl = PlaylistsManager.createPlaylist(name);
      if (pl && STATE.pendingPickerTrack) {
        PlaylistsManager.addTrack(pl.id, STATE.pendingPickerTrack);
        showToast(`Created & added to "${pl.name}"`, 'playlist_add');
        elements.modalPlaylistPicker.classList.add('hidden');
        renderPlaylistsGrid();
      }
    }
  });

  // Modal Closers
  elements.btnCloseAlbumModal.addEventListener('click', () => {
    elements.modalAlbum.classList.add('hidden');
  });
  elements.btnClosePlaylistModal.addEventListener('click', () => {
    elements.modalPlaylist.classList.add('hidden');
  });
  elements.btnClosePickerModal.addEventListener('click', () => {
    elements.modalPlaylistPicker.classList.add('hidden');
  });

  // Album Modal: Play All
  elements.btnModalAlbumPlay.addEventListener('click', () => {
    if (!STATE.currentViewingAlbum || !STATE.currentViewingAlbum.tracks.length) return;
    playHapticSfx('play');
    STATE.queue = [...STATE.currentViewingAlbum.tracks];
    updateQueueBadges();
    renderQueueList();
    playTrackAtIndex(0);
    elements.modalAlbum.classList.add('hidden');
    showToast(`Playing album: ${STATE.currentViewingAlbum.title.slice(0, 24)}`, 'album');
    syncMiniPlayer();
  });

  // Album Modal: Queue All
  elements.btnModalAlbumQueue.addEventListener('click', () => {
    if (!STATE.currentViewingAlbum || !STATE.currentViewingAlbum.tracks.length) return;
    playHapticSfx('click');
    STATE.currentViewingAlbum.tracks.forEach(t => STATE.queue.push(t));
    updateQueueBadges();
    renderQueueList();
    showToast(`Added ${STATE.currentViewingAlbum.tracks.length} tracks to queue`, 'queue_music');
  });

  // Playlist Modal: Play All
  elements.btnModalPlaylistPlay.addEventListener('click', () => {
    const lists = PlaylistsManager.getPlaylists();
    const pl = lists.find(l => l.id === STATE.currentViewingPlaylistId);
    if (!pl || pl.tracks.length === 0) {
      showToast('Playlist is empty', 'info');
      return;
    }
    playHapticSfx('play');
    STATE.queue = [...pl.tracks];
    updateQueueBadges();
    renderQueueList();
    playTrackAtIndex(0);
    elements.modalPlaylist.classList.add('hidden');
    showToast(`Playing: ${pl.name}`, 'playlist_play');
    syncMiniPlayer();
  });

  // Playlist Modal: Shuffle
  elements.btnModalPlaylistShuffle.addEventListener('click', () => {
    const lists = PlaylistsManager.getPlaylists();
    const pl = lists.find(l => l.id === STATE.currentViewingPlaylistId);
    if (!pl || pl.tracks.length === 0) return;
    playHapticSfx('play');
    const shuffled = [...pl.tracks].sort(() => Math.random() - 0.5);
    STATE.queue = shuffled;
    updateQueueBadges();
    renderQueueList();
    playTrackAtIndex(0);
    elements.modalPlaylist.classList.add('hidden');
    showToast(`Shuffle: ${pl.name}`, 'shuffle');
    syncMiniPlayer();
  });

  // Playlist Modal: Delete
  elements.btnModalPlaylistDelete.addEventListener('click', () => {
    if (!STATE.currentViewingPlaylistId) return;
    if (confirm('Delete this playlist?')) {
      PlaylistsManager.deletePlaylist(STATE.currentViewingPlaylistId);
      elements.modalPlaylist.classList.add('hidden');
      showToast('Playlist deleted', 'delete');
      renderPlaylistsGrid();
    }
  });

  // Queue Clear
  elements.btnClearQueue.addEventListener('click', () => {
    playHapticSfx('click');
    if (confirm('Clear entire queue?')) {
      elements.audio.pause();
      STATE.queue = [];
      STATE.currentIndex = -1;
      updatePlayPauseUI(false);
      resetPlayerUI();
      updateQueueBadges();
      renderQueueList();
      showToast('Queue cleared', 'delete_sweep');
    }
  });

  // Settings: Backend Test (if present)
  if (elements.btnTestBackend && elements.settingBackendUrl) {
    elements.btnTestBackend.addEventListener('click', async () => {
      playHapticSfx('click');
      const url = elements.settingBackendUrl.value.trim();
      if (elements.backendTestResult) elements.backendTestResult.classList.remove('hidden');
      if (elements.backendTestStatus) elements.backendTestStatus.textContent = 'Testing connection...';
      if (elements.backendTestResult) elements.backendTestResult.className = 'test-result-box';

      const ok = await testBackendHealth(url);
      if (ok) {
        STATE.backendUrl = url;
        localStorage.setItem('pixelbeats_backend_url', url);
        if (elements.backendTestStatus) elements.backendTestStatus.textContent = '✓ Connected: 100% Operational';
        if (elements.backendTestResult) elements.backendTestResult.classList.add('success');
        showToast('Backend Connected', 'cloud_done');
      } else {
        if (elements.backendTestStatus) elements.backendTestStatus.textContent = '✖ Unreachable: Check IP or server';
        if (elements.backendTestResult) elements.backendTestResult.classList.add('error');
      }
    });
  }

  // Settings: Fallback Switch
  if (elements.settingAutoFallback) {
    elements.settingAutoFallback.addEventListener('change', () => {
      STATE.autoFallback = elements.settingAutoFallback.checked;
      localStorage.setItem('pixelbeats_auto_fallback', STATE.autoFallback);
    });
  }

  // Settings: SFX Switch
  if (elements.settingSfx) {
    elements.settingSfx.addEventListener('change', () => {
      STATE.sfxEnabled = elements.settingSfx.checked;
      localStorage.setItem('pixelbeats_sfx', STATE.sfxEnabled);
      if (STATE.sfxEnabled) playHapticSfx('play');
    });
  }

  // Lyrics user manual scroll detection
  if (elements.lyricsScrollList) {
    const handleLyricsUserScroll = () => {
      isUserScrollingLyrics = true;
      clearTimeout(userScrollTimer);
      userScrollTimer = setTimeout(() => { isUserScrollingLyrics = false; }, 2400);
    };
    elements.lyricsScrollList.addEventListener('wheel', handleLyricsUserScroll, { passive: true });
    elements.lyricsScrollList.addEventListener('touchstart', () => {
      isUserScrollingLyrics = true;
      clearTimeout(userScrollTimer);
    }, { passive: true });
    elements.lyricsScrollList.addEventListener('touchend', () => {
      clearTimeout(userScrollTimer);
      userScrollTimer = setTimeout(() => { isUserScrollingLyrics = false; }, 2400);
    }, { passive: true });
  }

  // Audio Equalizer Presets
  document.querySelectorAll('.eq-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      playHapticSfx('click');
      document.querySelectorAll('.eq-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyEqPreset(pill.dataset.preset, true);
    });
  });

  // Sleep Timer Pills
  document.querySelectorAll('.sleep-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      playHapticSfx('click');
      document.querySelectorAll('.sleep-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      setSleepTimer(pill.dataset.time);
    });
  });

  // Floating Mini-Player Pill Handlers
  if (elements.floatingMiniPlayer) {
    elements.floatingMiniPlayer.addEventListener('click', (e) => {
      if (e.target.closest('.mini-action-btn') || e.target.closest('.mini-controls') || e.target.closest('#mini-btn-play') || e.target.closest('#mini-btn-next')) {
        return;
      }
      playHapticSfx('click');
      switchTab('tab-player');
    });
  }

  if (elements.miniBtnPlay) {
    elements.miniBtnPlay.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playHapticSfx('play');
      togglePlayPause();
    });
  }

  if (elements.miniBtnNext) {
    elements.miniBtnNext.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playHapticSfx('click');
      playNextTrack();
    });
  }

  // Global capture-phase delegation: guarantees mini play/pause & next work from ANY tab
  document.addEventListener('click', (e) => {
    const playTarget = e.target.closest('#mini-btn-play, .mini-action-btn[title*="Play"]');
    if (playTarget) {
      e.preventDefault();
      e.stopPropagation();
      playHapticSfx('play');
      togglePlayPause();
      return;
    }
    const nextTarget = e.target.closest('#mini-btn-next, .mini-action-btn[title*="Next"]');
    if (nextTarget) {
      e.preventDefault();
      e.stopPropagation();
      playHapticSfx('click');
      playNextTrack();
      return;
    }
  }, true);

  // Restore Equalizer preset on startup and listen for visibilitychange for sleep timer
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sleepEndTime && sleepEndTime !== 'end') {
      checkSleepTimerTick();
    }
  });

  // Web Audio User Interaction Unlocker
  const unlockAudioContext = () => {
    getAudioContext();
    ensureWebAudioActive();
    document.removeEventListener('click', unlockAudioContext);
    document.removeEventListener('touchstart', unlockAudioContext);
    document.removeEventListener('keydown', unlockAudioContext);
  };
  document.addEventListener('click', unlockAudioContext);
  document.addEventListener('touchstart', unlockAudioContext);
  document.addEventListener('keydown', unlockAudioContext);
}

/**
 * Android Native Media Notification & Lock Screen Controls (Spotify-Style)
 * Intercepts Play, Pause, Next, Previous, and Live Scrubber Seek from Notification Shade
 */
function setupNativeMediaControls() {
  if (typeof window === 'undefined' || !window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.ArchiveTune) {
    return;
  }
  const ArchiveTune = window.Capacitor.Plugins.ArchiveTune;
  ArchiveTune.addListener('mediaAction', (data) => {
    console.log('[Native Media Action]', data);
    if (!data || !data.action) return;

    switch (data.action) {
      case 'play':
        if (elements.audio && (elements.audio.paused || !STATE.isPlaying)) {
          togglePlayPause();
        }
        break;
      case 'pause':
        if (elements.audio && (!elements.audio.paused || STATE.isPlaying)) {
          togglePlayPause();
        }
        break;
      case 'toggle':
        togglePlayPause();
        break;
      case 'next':
        playNextTrack();
        break;
      case 'previous':
        playPrevTrack();
        break;
      case 'seek':
        if (typeof data.position === 'number' && !isNaN(data.position) && elements.audio) {
          const seekPos = Math.max(0, data.position);
          elements.audio.currentTime = seekPos;
          updateScrubberUI(seekPos, elements.audio.duration || 0);
          syncLyricsWithTime(seekPos, true);
          updateMediaSessionPositionState();
        }
        break;
      case 'stop':
        if (elements.audio) elements.audio.pause();
        STATE.isPlaying = false;
        updatePlayPauseUI(false);
        ArchiveTuneBridge.hideMediaNotification();
        break;
    }
  });
}

function syncCreatorAvatarFromGitHub() {
  try {
    const avatarImg = document.getElementById('creator-avatar-img');
    if (!avatarImg) return;
    const liveAvatarUrl = 'https://github.com/prajoy-ux.png';
    const imgLoader = new Image();
    imgLoader.onload = () => {
      avatarImg.src = liveAvatarUrl;
    };
    imgLoader.src = liveAvatarUrl;
  } catch (e) {}
}

// ================= APP INITIALIZATION =================
async function initApp() {
  console.log('✨ Initializing PixelMusic Material You Audio Engine...');

  // 1. Setup UI listeners, native media session controls, and creator avatar sync
  try {
    setupEventListeners();
    setupNativeMediaControls();
    syncCreatorAvatarFromGitHub();
  } catch (err) {
    console.error('[Init] Listener error:', err);
  }

  // 2. Initialize M3 Expressive physics, gestures, ripples, and interactions
  try {
    initScrubberInteractions();
    initAlbumCoverGestures();
    initSplitTrackVolumePill();
    initGlobalRipple();
  } catch (m3Err) {
    console.warn('[Init] Expressive init warning:', m3Err);
  }

  // 3. Apply initial Material You Theme
  applyTheme(STATE.currentTheme, false);

  // 4. Set initial settings
  if (elements.settingSfx) elements.settingSfx.checked = STATE.sfxEnabled;
  if (elements.settingAutoFallback) elements.settingAutoFallback.checked = STATE.autoFallback;
  if (elements.settingBackendUrl) elements.settingBackendUrl.value = STATE.backendUrl;

  // Apply saved EQ preset (Native Android DSP & Web Audio)
  const savedEq = STATE.eqPreset || 'flat';
  document.querySelectorAll('.eq-pill').forEach(p => p.classList.toggle('active', p.dataset.preset === savedEq));
  applyEqPreset(savedEq, false);

  // 5. Initialize volume & controls from persistent storage
  const initVol = (typeof STATE.currentVolume === 'number' && !isNaN(STATE.currentVolume)) ? STATE.currentVolume : 0.75;
  if (elements.audio) {
    elements.audio.muted = false;
    elements.audio.volume = initVol;
  }
  updateVolumeVisuals(initVol);
  enforceSliderStyles();
  if (elements.btnAutoCycle) elements.btnAutoCycle.classList.toggle('active', STATE.isAutoCycle);
  if (elements.autoCycleLabel) elements.autoCycleLabel.textContent = 'CYCLE';
  enforceSliderStyles();

  // 6. Detect Capacitor Platform
  if (elements.capStatus) {
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      elements.capStatus.textContent = `Android Native (${window.Capacitor.getPlatform()})`;
    } else {
      elements.capStatus.textContent = 'Web / PWA Mode';
    }
  }

  // 7. Initialize Offline Vault
  try {
    await OfflineVault.init();
    await updateVaultUI();
  } catch (dbErr) {
    console.warn('[Vault] IndexedDB warning:', dbErr);
  }

  // 8. Start Ambient Glow Animation Loop
  try {
    renderAmbientGlow();
  } catch (err) {}

  // 9. INSTANT COLD-START RENDER (0ms latency!)
  // Immediately populate the UI with cached or pre-packaged seed tracks
  try {
    const rawCached = localStorage.getItem('pixelbeats_cached_trending');
    let initialTracks = SEED_TRENDING_TRACKS;
    if (rawCached) {
      try {
        const parsed = JSON.parse(rawCached);
        if (Array.isArray(parsed) && parsed.length > 0) initialTracks = parsed;
      } catch (pe) {}
    }
    STATE.trendingTracks = initialTracks;
    renderSearchResults(initialTracks, 'Trending & Handpicked');
    if (initialTracks.length > 0) {
      prefetchTrackAudioAndLyrics(initialTracks[0]);
    }
  } catch (renderErr) {
    console.warn('[Init] Quick-render notice:', renderErr);
  }

  // 10. Position Apple Music-style spring nav indicator immediately
  positionNavIndicator(false);

  // 11. NON-BLOCKING Background Health Check & Fresh Trending Sync
  // Runs in the background so mobile startup is never delayed!
  (async () => {
    try {
      await testBackendHealth();
    } catch (e) {}
    try {
      await loadTrendingTracks();
    } catch (e) {}
  })();
}

// Window resize & orientation handlers to keep spring indicator snapped
window.addEventListener('resize', () => {
  positionNavIndicator(false);
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => positionNavIndicator(false), 100);
});

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

