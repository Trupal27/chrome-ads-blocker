# Chrome Ads Blocker Privacy Policy

_Last updated: November 26, 2026_

Chrome Ads Blocker is a browser extension that blocks ads and trackers. It is built to work without collecting any information about you.

## What we collect

Nothing. Chrome Ads Blocker does not collect, transmit, sell or share any personal or browsing data.

## What is stored on your device

Chrome Ads Blocker keeps a few items in your browser's local extension storage (`chrome.storage`):

- whether blocking is turned on or off
- the list of sites you chose to turn Chrome Ads Blocker off for
- the number of items blocked (a running total, plus per-tab counts that are cleared when the tab closes)

This data stays on your device. It is never sent to us or to anyone else, and uninstalling the extension deletes it.

## How filtering works

Ad and tracker requests are blocked by Chrome's built-in `declarativeNetRequest` engine using a block list bundled with the extension. Chrome Ads Blocker does not see, log or upload the pages you visit. The content scripts that hide ads run only inside the page and do not send page content anywhere.

Chrome Ads Blocker makes no network requests of its own and does not load remote code.

## Permissions

- **declarativeNetRequest**: to block ad and tracker requests with the bundled list.
- **storage**: to remember your settings and counters on your device.
- **activeTab**: to show the current site and its blocked count when you open the popup.
- **Content scripts on all sites**: to hide ad boxes left on pages and to skip YouTube ads.

## Changes

If this policy changes, the updated version will be published at this address with a new date.

## Contact

Questions? Open an issue at https://github.com/Trupal27/chrome-ads-blocker/issues.
