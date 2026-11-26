// YouTube backup layer: if an ad still starts, mute it, fast-forward it
// and click "Skip". Also removes ad banners and promoted cards.
(() => {
  let enabled = true;

  chrome.storage.local.get({ enabled: true, whitelist: [] }, (s) => {
    enabled = s.enabled && !s.whitelist.includes(location.hostname);
    document.documentElement.dataset.adshieldOff = enabled ? "0" : "1";
    document.documentElement.classList.toggle("adshield-on", enabled);
  });
  chrome.storage.onChanged.addListener((c) => {
    if (c.enabled) {
      enabled = c.enabled.newValue;
      document.documentElement.dataset.adshieldOff = enabled ? "0" : "1";
      document.documentElement.classList.toggle("adshield-on", enabled);
    }
  });

  const SKIP_SELECTORS = [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button",
    "button[class*='skip-button']",
    ".ytp-ad-overlay-close-button",
  ];

  let counted = false;

  function handleAd() {
    if (!enabled) return;
    const player = document.querySelector(".html5-video-player");
    const video = document.querySelector("video.html5-main-video, #movie_player video");
    if (!player || !video) return;

    if (player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting")) {
      video.muted = true;
      if (isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.max(video.duration - 0.1, 0);
      }
      video.playbackRate = 16;
      for (const sel of SKIP_SELECTORS) {
        document.querySelectorAll(sel).forEach((b) => b.click());
      }
      if (!counted) {
        counted = true;
        chrome.runtime.sendMessage({ type: "ytAdSkipped" }).catch(() => {});
      }
    } else if (counted) {
      counted = false;
      if (video.playbackRate === 16) video.playbackRate = 1;
      video.muted = false;
    }
  }

  // Dismiss the "ad blockers are not allowed" popup if it shows up.
  function handleEnforcement() {
    if (!enabled) return;
    const dlg = document.querySelector("ytd-enforcement-message-view-model");
    if (dlg) {
      dlg.closest("tp-yt-paper-dialog")?.remove();
      document.querySelector("tp-yt-iron-overlay-backdrop")?.remove();
      const v = document.querySelector("video.html5-main-video");
      if (v && v.paused) v.play().catch(() => {});
    }
  }

  const obs = new MutationObserver(() => {
    handleAd();
    handleEnforcement();
  });

  function start() {
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    setInterval(handleAd, 300);
  }

  if (document.documentElement) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
