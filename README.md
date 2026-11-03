<div align="center">

  <img src="assets/logo.png" width="160" height="160" alt="PixelBeats Logo" style="border-radius: 28%; box-shadow: 0 8px 24px rgba(0,0,0,0.25);" />

  <h1>PixelBeats</h1>

  <p align="center">
    <strong>Redefining the Material You Music Experience on Android.</strong>
    <br />
    <em>High-performance, privacy-focused, Material Design 3 streaming audio player with an offline vault.</em>
  </p>

  <p align="center">
    <a href="#-showcase"><b>Showcase</b></a> •
    <a href="#-features"><b>Features</b></a> •
    <a href="#-architecture"><b>Architecture</b></a> •
    <a href="#-download"><b>Download</b></a> •
    <a href="#-tech-stack"><b>Tech Stack</b></a> •
    <a href="#-license"><b>License</b></a>
  </p>

  <div align="center">
    <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white&labelColor=1e1e2e" alt="Platform" />
    <img src="https://img.shields.io/badge/UI-Material%20Design%203-576028?style=for-the-badge&logo=materialdesign&logoColor=white&labelColor=1e1e2e" alt="Design" />
    <img src="https://img.shields.io/badge/Framework-Capacitor%206-119EFF?style=for-the-badge&logo=capacitor&logoColor=white&labelColor=1e1e2e" alt="Capacitor" />
    <img src="https://img.shields.io/badge/Backend-Python%20FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=1e1e2e" alt="Python" />
    <img src="https://img.shields.io/github/license/prajoy-ux/PixelBeats?style=for-the-badge&color=576028&labelColor=1e1e2e" alt="License" />
  </div>

</div>

<br />

---

> [!CAUTION]
> **IMPERSONATION WARNING — PIXELBEATS IS NOT ON GOOGLE PLAY**
>
> **PixelBeats has no official Google Play Store listing.** The PixelBeats maintainers have **not published, authorized, or endorsed any application on Google Play** under the PixelBeats name.
>
> Google Play listings that use the **PixelBeats name, logo, app icon, screenshots, or other official branding** are **unofficial third-party listings**, even if they look identical to this project. They are **not verified or supported by the PixelBeats maintainers** and should **not be mistaken for official releases**. Their contents and safety cannot be guaranteed.
>
> **Get the official PixelBeats only from trusted sources:** [GitHub Releases](https://github.com/prajoy-ux/PixelBeats/releases/latest).
>
> If you encounter a Google Play listing impersonating PixelBeats, **report it to Google Play** and [notify the maintainers](https://github.com/prajoy-ux/PixelBeats/issues/new).

---

> [!WARNING]
> **Forks are not supported in any way.**  
> We do not provide support, maintenance, troubleshooting, or assistance for any forked version of this project. If you choose to use a fork, you do so at your own risk.
>
> **PixelBeats** isn’t just another generic YouTube Music wrapper. It’s a fully custom-built player crafted with modern Material You tokens, an ultra-fast streaming proxy, and native Capacitor integration, because we believe your music should stay private, look clean, and work reliably everywhere.

---

> [!IMPORTANT]  
> **Geographic Availability:** If YouTube Music or streaming providers are restricted in your region, a VPN or proxy set to a supported region may be required for initial stream resolution.

---

## 📸 Showcase

<div align="center" id="showcase">

<table style="border: none; background: transparent;">
  <tr>
    <td align="center" width="25%" style="border: none;">
      <img src="assets/screenshots/screenshot_player.jpg" alt="Player Screen" width="100%" style="border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);" />
      <br /><sub><b>Player Screen</b></sub>
    </td>
    <td align="center" width="25%" style="border: none;">
      <img src="assets/screenshots/screenshot_lyrics.jpg" alt="Live Lyrics Overlay" width="100%" style="border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);" />
      <br /><sub><b>Live Synced Lyrics</b></sub>
    </td>
    <td align="center" width="25%" style="border: none;">
      <img src="assets/screenshots/screenshot_vault.jpg" alt="Offline Music Vault" width="100%" style="border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);" />
      <br /><sub><b>Offline Music Vault</b></sub>
    </td>
    <td align="center" width="25%" style="border: none;">
      <img src="assets/screenshots/screenshot_queue.jpg" alt="Up Next Queue" width="100%" style="border-radius: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);" />
      <br /><sub><b>Up Next Queue</b></sub>
    </td>
  </tr>
</table>

</div>

---

## ✨ Features

<div align="center" id="features">

<table>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <h3>🎵 Playback & Streaming</h3>
        <ul>
          <li>Ad-free continuous music streaming</li>
          <li>Lossless ALAC / FLAC high-res audio format indicator</li>
          <li>Background playback with native Android media notification controls</li>
          <li>Seamless Queue management & next-track auto-prefetch</li>
          <li>Hardware media button & headset remote integration</li>
        </ul>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <h3>🎛️ Audio Engine & Presets</h3>
        <ul>
          <li>Web Audio API parametric 5-band equalizer</li>
          <li>Presets: <b>Flat</b>, <b>Bass Boost</b>, <b>Acoustic</b>, <b>Lo-Fi Warmth</b>, <b>Vocal Crisp</b></li>
          <li>Persistent volume calibration across track switches</li>
          <li>Ultra-low latency audio buffer pipeline</li>
        </ul>
      </div>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <h3>📜 Synchronized Lyrics</h3>
        <ul>
          <li>Live time-synced lyrics overlay</li>
          <li>Real-time autoscrolling with active line highlight</li>
          <li>Tap-to-jump playback scrubbing via lyrics lines</li>
          <li>Cached lyric synchronization for offline playback</li>
        </ul>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <h3>💾 Offline Music Vault</h3>
        <ul>
          <li>One-tap offline caching to client-side IndexedDB vault</li>
          <li>Listen to full cached songs anywhere without internet</li>
          <li>Custom user playlist creation and batch export</li>
          <li>Track favoriting directly into Library</li>
        </ul>
      </div>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <h3>🎨 Material You Interface</h3>
        <ul>
          <li>Authentic Material Design 3 (M3) Earthy Olive / Matcha palette</li>
          <li>Floating stadium navigation dock with spring pill animation</li>
          <li>Persistent floating mini-player pill accessible across all tabs</li>
          <li>Lossless metadata badges and adaptive album art glow</li>
        </ul>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <h3>⏱️ Utilities & Smart Controls</h3>
        <ul>
          <li>Configurable Sleep Timer: 5, 15, 30, 60 minutes or End of Song</li>
          <li>Instant autocomplete search engine</li>
          <li>YouTube Music & JioSaavn stream resolution</li>
          <li>Lightweight installation footprint (&lt;6 MB APK)</li>
        </ul>
      </div>
    </td>
  </tr>
</table>

</div>

---

## 🏛️ Architecture

PixelBeats is engineered as a hybrid client-proxy architecture designed to bypass streaming throttles and guarantee background playback reliability on Android:

```mermaid
graph TD
    A[PixelBeats Android / Web App] -->|HTML5 Audio / Web Audio API| B(Local Streaming Proxy)
    B -->|Innertube Signature Decryption| C[YouTube Music Engine]
    B -->|Deobfuscator Provider| D[JioSaavn / CDNs]
    A -->|IndexedDB Vault| E[Offline Audio Storage]
    A -->|Capacitor Plugins| F[Android MediaSession & Notifications]
```

- **Frontend**: Single-page application built with vanilla HTML5, CSS tokens, and JavaScript without heavy framework overhead.
- **Native Bridge**: Capacitor 6 with custom plugins for hardware media keys, audio focus, and background execution.
- **Backend Stream Engine**: FastAPI micro-service utilizing custom player decrypters and LRU chunk caching.

---

## 📥 Download

<div align="center" id="download">

<table>
  <thead>
    <tr>
      <th align="center">GitHub</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://github.com/prajoy-ux/PixelBeats/releases/latest">
          <img src="assets/badge_github.png" height="50" alt="Get PixelBeats on GitHub" />
        </a>
      </td>
    </tr>
  </tbody>
</table>

</div>

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Interface** | HTML5, CSS3, ES2024 | Vanilla Material Design 3 tokens & zero-dependency UI |
| **Audio Pipeline** | Web Audio API | 5-band parametric equalizer & biquad filters |
| **Mobile Runtime** | Capacitor 6 | Android WebView container with native bridge |
| **Local Storage** | IndexedDB | Offline audio track and playlist persistence |
| **Streaming Backend** | Python 3, FastAPI, Uvicorn | Reverse streaming proxy with signature cipher solving |

---

## ⚖️ Legal Disclaimer

PixelBeats is an independent third-party client developed for educational and personal use:
- It is not affiliated with, endorsed by, or sponsored by Google LLC or YouTube.
- It does not bypass technical protections or host proprietary media files.
- Users are encouraged to support their favorite artists through official music platforms.

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)** — see the [LICENSE](LICENSE) file for details.

<br />

<div align="center">
  <p><b>If PixelBeats elevated your music experience, please consider giving the repository a ⭐!</b></p>
</div>
