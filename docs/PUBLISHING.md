# Publishing to the Chrome Web Store

## One-time setup

1. Sign in at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and pay the one-time US$5 registration fee.
2. Verify the contact email on the **Account** page. You can't publish until it's verified.
3. Turn on GitHub Pages for this repo (Settings → Pages → deploy from `main`, root folder). Your privacy policy URL is then
   `https://trupal27.github.io/adshield/PRIVACY` (or link straight to `PRIVACY.md` on GitHub).

## Each release

1. Bump `version` in **both** `src/manifest.json` and `package.json` (the store rejects a version it has seen before).
2. Add the changes to `CHANGELOG.md`.
3. `npm run build`, then load `src/` unpacked and smoke-test YouTube plus a couple of news sites.
4. Commit, tag and push: `git tag v1.0.1 && git push --tags`. The Release workflow attaches the zip to a GitHub Release.
5. In the dashboard: **Package → Upload new package** → `dist/adshield-<version>.zip` → **Submit for review**.

Reviews usually take a few days. Changes to permissions or host access take longer.

## Store listing (copy into the dashboard)

**Name:** AdShield - Ad & YouTube Ad Blocker

**Summary (max 132 chars):**
Blocks ads, trackers and YouTube ads. Lightweight, open source, and collects no data.

**Category:** Make Chrome Yours → Privacy & Security

**Description:**

> AdShield blocks ads and trackers so pages load faster and cleaner.
>
> • Blocks 130+ ad and tracker networks, including Google Ads, DoubleClick, Taboola, Outbrain, Criteo and popunder networks
> • Hides leftover ad boxes and empty ad spaces
> • YouTube: removes most video ads before they start, skips any that slip through, and hides feed, banner and sidebar ads
> • One switch to turn it on or off, plus "Turn off for this site" for sites you want to support
> • Shows how many items were blocked on each page
>
> Private by design: AdShield collects no data, makes no network requests of its own, and runs entirely in your browser.
>
> Open source: https://github.com/Trupal27/adshield

**Assets you need to make:**

| Asset | Size | Required |
|---|---|---|
| Store icon | 128×128 PNG (use `src/icons/icon128.png`) | yes |
| Screenshots | 1280×800 or 640×400, 1–5 images | yes, at least 1 |
| Small promo tile | 440×280 | yes |
| Marquee promo tile | 1400×560 | optional |

Good screenshots: the open popup on a news site, YouTube with no ads, and a before/after of an article page.

## Privacy practices tab

**Single purpose:**
AdShield blocks advertisements and trackers on web pages, including video ads on YouTube.

**Permission justifications:**

- **declarativeNetRequest**: Blocks requests to known ad and tracker servers using a rule list bundled with the extension. Also used to add per-site allow rules when the user turns AdShield off for a site.
- **storage**: Saves the on/off setting, the user's list of allowed sites, and blocked-item counters, all on the user's device.
- **activeTab**: When the user opens the popup, reads the current tab's address to show the site name and its blocked-request count.
- **Host permission (content scripts on all sites)**: Content scripts hide ad containers left on pages after network blocking, and on YouTube remove ad data and skip video ads. They don't read, store or send page content.

**Remote code:** No, I am not using remote code.

**Data usage:** tick none of the data types. Then certify:
- I do not sell or transfer user data to third parties
- I do not use or transfer user data for purposes unrelated to the item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending

**Privacy policy URL:** the GitHub Pages or GitHub link from setup step 3.
