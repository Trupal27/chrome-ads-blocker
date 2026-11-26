const $ = (id) => document.getElementById(id);

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let host = "";
  try {
    const u = new URL(tab.url);
    if (u.protocol.startsWith("http")) host = u.hostname;
  } catch (_) {}

  $("site").textContent = host || "This page can't be filtered";

  const s = await chrome.storage.local.get({ enabled: true, whitelist: [], total: 0 });

  // Network requests blocked on this tab. Opening the popup grants
  // activeTab, which is enough for getMatchedRules (and exempt from quota).
  let netCount = 0;
  try {
    const { rulesMatchedInfo } = await chrome.declarativeNetRequest.getMatchedRules({
      tabId: tab.id,
    });
    netCount = rulesMatchedInfo.filter((m) => m.rule.rulesetId === "ads").length;
  } catch (_) {}

  // Fold newly seen network blocks into the lifetime total.
  const ytKey = "yt_" + tab.id;
  const seenKey = "seen_" + tab.id;
  const sess = await chrome.storage.session.get({ [ytKey]: 0, [seenKey]: 0 });
  const delta = netCount >= sess[seenKey] ? netCount - sess[seenKey] : netCount;
  if (delta > 0) {
    s.total += delta;
    await chrome.storage.local.set({ total: s.total });
  }
  await chrome.storage.session.set({ [seenKey]: netCount });

  $("enabled").checked = s.enabled;
  $("totalCount").textContent = s.total.toLocaleString();
  $("tabCount").textContent = (netCount + sess[ytKey]).toLocaleString();

  function render(enabled, whitelist) {
    const trusted = whitelist.includes(host);
    document.body.classList.toggle("off", !enabled);
    $("status").textContent = enabled ? "Shields are ON" : "Shields are OFF";
    $("siteBtn").disabled = !host || !enabled;
    $("siteBtn").textContent = trusted ? "Turn back on for this site" : "Turn off for this site";
  }
  render(s.enabled, s.whitelist);

  $("enabled").addEventListener("change", async (e) => {
    await chrome.storage.local.set({ enabled: e.target.checked });
    const { whitelist } = await chrome.storage.local.get({ whitelist: [] });
    render(e.target.checked, whitelist);
  });

  $("siteBtn").addEventListener("click", async () => {
    let { whitelist } = await chrome.storage.local.get({ whitelist: [] });
    whitelist = whitelist.includes(host)
      ? whitelist.filter((d) => d !== host)
      : [...whitelist, host];
    await chrome.storage.local.set({ whitelist });
    render($("enabled").checked, whitelist);
    chrome.tabs.reload(tab.id);
  });

  $("reloadBtn").addEventListener("click", () => {
    chrome.tabs.reload(tab.id);
    window.close();
  });
})();
