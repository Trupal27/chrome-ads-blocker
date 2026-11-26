// Runs inside YouTube's own page context, before YouTube's scripts.
// Strips ad data out of the player responses so ads never get scheduled.
(() => {
  if (window.__cabMain) return;
  window.__cabMain = true;

  // Respect the on/off switch (set by youtube.js via a DOM attribute).
  const isOff = () => document.documentElement?.dataset.cabOff === "1";

  const AD_KEYS = [
    "adPlacements",
    "adSlots",
    "playerAds",
    "adBreakHeartbeatParams",
    "adParams",
  ];

  function prune(obj) {
    if (!obj || typeof obj !== "object" || isOff()) return obj;
    try {
      for (const k of AD_KEYS) if (k in obj) delete obj[k];
      if (obj.playerResponse) prune(obj.playerResponse);
      if (Array.isArray(obj)) obj.forEach(prune);
    } catch (_) {}
    return obj;
  }

  // 1) JSON.parse hook
  const origParse = JSON.parse;
  JSON.parse = function (...args) {
    return prune(origParse.apply(this, args));
  };

  // 2) Initial page data
  for (const name of ["ytInitialPlayerResponse", "playerResponse"]) {
    let value;
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        get: () => value,
        set: (v) => { value = prune(v); },
      });
    } catch (_) {}
  }

  // 3) fetch() responses from the player API
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await origFetch.apply(this, args);
    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      if (!isOff() && /\/youtubei\/v1\/(player|next)/.test(url)) {
        const data = prune(await res.clone().json());
        return new Response(JSON.stringify(data), {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      }
    } catch (_) {}
    return res;
  };
})();
