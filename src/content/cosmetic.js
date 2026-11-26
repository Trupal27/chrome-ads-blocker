// Hides ad boxes on normal websites (the empty spaces left after
// network blocking, plus ads served from the site itself).
(() => {
  const SELECTORS = [
    "ins.adsbygoogle",
    "[id^='google_ads_iframe']",
    "[id^='div-gpt-ad']",
    "[data-google-query-id]",
    "iframe[src*='doubleclick.net']",
    "iframe[src*='googlesyndication.com']",
    "iframe[src*='amazon-adsystem.com']",
    "iframe[id^='aswift_']",
    "[id^='taboola-']",
    ".trc_rbox_container",
    ".OUTBRAIN",
    "[data-widget-id^='outbrain']",
    ".adsbox",
    ".ad-banner",
    ".ad-container",
    ".ad-slot",
    ".ad-wrapper",
    ".advertisement",
    ".advert",
    ".sponsored-ad",
    "[class^='ad-unit']",
    "[id^='ad-slot']",
    "[id^='adslot']",
    "[aria-label='Advertisement']",
    "[data-ad-slot]",
    "[data-ad-unit]",
    "[data-adunit]",
    "amp-ad",
    "amp-embed[type='taboola']",
  ];

  chrome.storage.local.get({ enabled: true, whitelist: [] }, (s) => {
    if (!s.enabled || s.whitelist.includes(location.hostname)) return;

    const style = document.createElement("style");
    style.id = "cab-cosmetic";
    style.textContent = SELECTORS.join(",\n") + " { display: none !important; }";
    (document.head || document.documentElement).appendChild(style);
  });
})();
