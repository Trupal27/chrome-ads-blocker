<p align="center">
  <img src="src/icons/icon128.png" width="96" alt="AdShield logo" />
</p>

<h1 align="center">AdShield</h1>

<p align="center">
  A lightweight, open source ad, tracker and YouTube ad blocker for Chrome.<br/>
  Manifest V3 · no data collection · no remote code
</p>

---

## Features

- **Network blocking**: blocks requests to more than 130 ad and tracker networks (Google Ads, DoubleClick, Taboola, Outbrain, Criteo, Amazon ads, popunder networks and more) using Chrome's built-in [declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest) engine.
- **Cosmetic filtering**: hides leftover ad boxes and empty ad slots on websites.
- **YouTube**:
  - removes ad data from the player response before the player reads it, so most ads never start
  - if an ad does start, mutes it, skips to the end and clicks "Skip"
  - hides home-feed ads, banners, promoted videos and sidebar ads
  - closes the "ad blockers are not allowed" popup
- **Popup**: one master switch, "Turn off for this site", and blocked counts for the current page and in total.
- **Badge** on the toolbar icon showing how many requests were blocked on the current tab.

## Install

**Chrome Web Store:** _coming soon_

**From source (developer mode):**

1. Download or clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `src` folder.
4. Pin AdShield from the puzzle-piece menu.

## Privacy

AdShield collects nothing. All filtering happens locally in your browser. Settings and counters are stored with `chrome.storage` on your device and never leave it. See [PRIVACY.md](PRIVACY.md).

## Project layout

```
src/                     the extension (this folder is what ships to the store)
  manifest.json
  background.js          on/off switch, per-site allow list, counters
  rules/ads.json         GENERATED from filters/network.txt (do not edit by hand)
  content/cosmetic.js    hides ad boxes on normal websites
  content/youtube-main.js  strips ad data from YouTube's player (page context)
  content/youtube.js     auto-skips/mutes any YouTube ad that still plays
  content/youtube.css    hides YouTube ad sections
  popup/                 toolbar popup
filters/network.txt      network block list, one filter per line
scripts/                 build and validation scripts
docs/                    store listing text and release guide
```

## Development

Requires Node.js 18+. There are no npm dependencies.

```bash
npm run build:rules   # regenerate src/rules/ads.json from filters/network.txt
npm run check         # validate manifest, rules and JS syntax
npm run build         # validate and create dist/adshield-<version>.zip
```

After editing files, click the reload icon on the AdShield card in `chrome://extensions`.

## Contributing

Ads got through, or a site broke? Please [open an issue](https://github.com/Trupal27/adshield/issues/new/choose). Pull requests are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
