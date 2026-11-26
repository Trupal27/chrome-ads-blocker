// AdShield background service worker
const WHITELIST_BASE_ID = 100000;

chrome.runtime.onInstalled.addListener(async () => {
  const s = await chrome.storage.local.get({ enabled: true, whitelist: [], total: 0 });
  await chrome.storage.local.set(s);
  await applyState();
});
chrome.runtime.onStartup.addListener(applyState);

// Show the number of blocked requests on the toolbar icon.
chrome.declarativeNetRequest.setExtensionActionOptions?.({
  displayActionCountAsBadgeText: true,
});
chrome.action.setBadgeBackgroundColor({ color: "#e8452c" });

async function applyState() {
  const { enabled, whitelist } = await chrome.storage.local.get({
    enabled: true,
    whitelist: [],
  });

  await chrome.declarativeNetRequest.updateEnabledRulesets(
    enabled ? { enableRulesetIds: ["ads"] } : { disableRulesetIds: ["ads"] }
  );

  // Allow-list rules: one per trusted site.
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const addRules = whitelist.map((domain, i) => ({
    id: WHITELIST_BASE_ID + i,
    priority: 100,
    action: { type: "allowAllRequests" },
    condition: { requestDomains: [domain], resourceTypes: ["main_frame", "sub_frame"] },
  }));
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules,
  });

  chrome.action.setIcon({
    path: enabled
      ? { 16: "icons/icon16.png", 32: "icons/icon32.png" }
      : { 16: "icons/off16.png", 32: "icons/off32.png" },
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled || changes.whitelist) applyState();
});

// ---- Counting ----
// Blocked network requests are read on demand by the popup via
// declarativeNetRequest.getMatchedRules (works in Web Store installs,
// unlike onRuleMatchedDebug). Here we only count skipped YouTube ads.
async function bumpYt(tabId) {
  const { total = 0 } = await chrome.storage.local.get("total");
  await chrome.storage.local.set({ total: total + 1 });
  if (tabId >= 0) {
    const key = "yt_" + tabId;
    const cur = (await chrome.storage.session.get(key))[key] || 0;
    await chrome.storage.session.set({ [key]: cur + 1 });
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "ytAdSkipped") bumpYt(sender.tab?.id ?? -1);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(["yt_" + tabId, "seen_" + tabId]);
});
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === "loading") chrome.storage.session.remove("yt_" + tabId);
});
