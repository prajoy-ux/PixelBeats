# PixelBeats 🎵

PixelBeats is a modern, Material Design 3-inspired mobile music streaming application built with web technologies, Capacitor, and an intelligent Python backend proxy with offline caching, synchronized lyrics, audio presets, and background playback.

## ✨ Features

- **Material You Design**: Earthy olive / matcha aesthetic with stadium floating bottom navigation and floating mini-player pill.
- **Audio Streaming & Offline Vault**: Stream high-quality tracks and save favorite tracks into the IndexedDB offline vault.
- **Synchronized Lyrics**: Live, time-synced lyrics viewer.
- **Audio Equalizer & Presets**: Built-in Web Audio API parametric EQ (Flat, Bass Boost, Acoustic, Lo-Fi Warmth, Vocal Crisp).
- **Sleep Timer**: Auto-pause playback after 5, 15, 30, 60 minutes or at the end of the song.
- **Android Native Integration**: Packaged with Capacitor with full background playback support and media controls.

## 🛠️ Project Structure

```
pixelbeats/
├── android/          # Capacitor Android native project & Gradle build
├── backend/          # Python streaming & proxy server
│   ├── main.py       # FastAPI backend & streaming proxy
│   └── requirements.txt
├── www/              # Frontend web application (HTML5, Vanilla CSS, JS)
│   ├── app.js        # Core player logic, UI controls & audio engine
│   ├── index.html    # Single-page Material 3 application
│   └── style.css     # Design system & responsive layout
└── capacitor.config.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- Android Studio / Android SDK (for building the Android APK)

### 1. Run the Backend Proxy

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On Windows (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python main.py
```

The streaming proxy will run at `http://127.0.0.1:8000`.

### 2. Run / Preview Frontend

Serve the `www` folder using any local HTTP server (or Live Server):

```bash
npx serve www
```

### 3. Build Android APK

```bash
# Sync web assets to Android
npx cap sync android

# Build Debug APK
cd android
./gradlew assembleDebug      # .\gradlew.bat assembleDebug on Windows
```

The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## 📄 License

MIT License
