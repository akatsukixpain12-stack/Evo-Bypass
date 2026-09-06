const DEFAULT_API_URL = "http://localhost:3000";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "resolve-link",
    title: "Resolve with EVO Bypass",
    contexts: ["link", "page", "selection"]
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open-resolver") {
    chrome.action.openPopup().catch(() => undefined);
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const candidate = info.linkUrl || info.selectionText || info.pageUrl || tab?.url;
  if (!candidate) return;

  const { apiUrl = DEFAULT_API_URL } = await chrome.storage.local.get("apiUrl");
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/bypass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: candidate.trim() })
    });
    const data = await response.json();
    if (data.success && data.destination) {
      await chrome.tabs.create({ url: data.destination });
    }
  } catch {
    await chrome.tabs.create({ url: `${apiUrl.replace(/\/$/, "")}/?url=${encodeURIComponent(candidate)}` });
  }
});
