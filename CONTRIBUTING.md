# Contributing to AdShield

Thanks for helping. Most useful contributions are small: a missed ad network, a broken site, or an updated YouTube selector.

## Reporting

- **An ad got through** or **a site broke**: open an issue using the matching template and include the page URL.
- **Security issue**: please see [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Adding a blocked domain

1. Add a line to [filters/network.txt](filters/network.txt), for example `||ads.example.com^`.
2. Run `npm run build:rules` to regenerate `src/rules/ads.json`.
3. Load `src/` unpacked and check that a few popular sites still work.
4. Commit both files.

Don't edit `src/rules/ads.json` by hand; CI fails if it doesn't match `filters/network.txt`.

## Fixing YouTube

YouTube changes its page structure often. The relevant files are:

- `src/content/youtube-main.js`: removes ad fields from player data (runs in the page's own context)
- `src/content/youtube.js`: mutes and skips ads that still play, and closes the anti-adblock dialog
- `src/content/youtube.css`: hides ad elements

Please describe in your pull request what changed on YouTube and how you tested it.

## Pull request checklist

- [ ] `npm run check` passes
- [ ] Tested by loading `src/` unpacked in Chrome
- [ ] No new permissions, remote code or network requests (open an issue first if you think one is needed)
- [ ] For a user-facing change, an entry in `CHANGELOG.md` under "Unreleased"
