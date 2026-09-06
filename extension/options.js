const input = document.querySelector("#api-url");
const form = document.querySelector("#settings-form");
const saved = document.querySelector("#saved");

chrome.storage.local.get({ apiUrl: "http://localhost:3000" }).then(({ apiUrl }) => {
  input.value = apiUrl;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const url = new URL(input.value);
    await chrome.storage.local.set({ apiUrl: url.origin });
    saved.textContent = "Saved. The extension will use this API now.";
  } catch {
    saved.textContent = "Enter a valid API URL, such as http://localhost:3000.";
  }
});
