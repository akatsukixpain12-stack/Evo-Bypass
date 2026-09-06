const form = document.querySelector("#form");
const input = document.querySelector("#url");
const resolveButton = document.querySelector("#resolve");
const currentTabButton = document.querySelector("#current-tab");
const message = document.querySelector("#message");
const result = document.querySelector("#result");
const service = document.querySelector("#service");
const time = document.querySelector("#time");
const destination = document.querySelector("#destination");
const open = document.querySelector("#open");
const copy = document.querySelector("#copy");
const status = document.querySelector("#status");
const pasteButton = document.querySelector("#paste");
const settingsButton = document.querySelector("#settings");

function showMessage(text) {
  message.textContent = text;
}

async function getApiUrl() {
  const { apiUrl = "http://localhost:3000" } = await chrome.storage.local.get("apiUrl");
  return apiUrl.replace(/\/$/, "");
}

async function loadCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) input.value = tab.url;
}

currentTabButton.addEventListener("click", loadCurrentTab);
pasteButton.addEventListener("click", async () => {
  try {
    input.value = await navigator.clipboard.readText();
    input.focus();
  } catch {
    showMessage("Clipboard access was blocked. Paste with Ctrl+V instead.");
  }
});
settingsButton.addEventListener("click", () => chrome.runtime.openOptionsPage());

Promise.all([getApiUrl(), loadCurrentTab()]).then(async ([apiUrl]) => {
  try {
    const response = await fetch(`${apiUrl}/api/health`);
    const data = await response.json();
    status.innerHTML = `<span></span> ${data.status === "operational" ? "Resolver online" : "Resolver unavailable"}`;
  } catch {
    status.innerHTML = '<span class="offline-dot"></span> Start API on port 3000';
  }
});

copy.addEventListener("click", async () => {
  await navigator.clipboard.writeText(destination.href);
  copy.textContent = "Copied";
  window.setTimeout(() => { copy.textContent = "Copy result"; }, 1500);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.classList.add("hidden");
  showMessage("");
  resolveButton.disabled = true;
  resolveButton.textContent = "...";

  try {
    new URL(input.value);
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/api/bypass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: input.value })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "This link could not be resolved.");

    service.textContent = data.service || "EVO";
    time.textContent = `${data.processingTime || 0}ms`;
    destination.textContent = data.destination;
    destination.href = data.destination;
    open.href = data.destination;
    result.classList.remove("hidden");
  } catch (error) {
    showMessage(error.message === "Invalid URL" ? "Paste a complete link starting with https://." : error.message);
  } finally {
    resolveButton.disabled = false;
    resolveButton.textContent = "Go";
  }
});
