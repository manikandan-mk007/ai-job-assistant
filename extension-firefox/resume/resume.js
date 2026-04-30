const API_DEFAULT = "http://127.0.0.1:8000/api/v1";

const els = {
  settingsBtn: document.getElementById("settingsBtn"),
  resumeFileInput: document.getElementById("resumeFileInput"),
  uploadBtn: document.getElementById("uploadBtn"),
  clearBtn: document.getElementById("clearBtn"),
  copyBtn: document.getElementById("copyBtn"),
  openProfileBtn: document.getElementById("openProfileBtn"),
  messageBox: document.getElementById("messageBox"),
  resumeText: document.getElementById("resumeText")
};

function storageGet(keys) {
  return browser.storage.local.get(keys);
}

async function getApiBase() {
  const data = await storageGet(["apiBase"]);
  return data.apiBase || API_DEFAULT;
}

async function getToken() {
  const data = await storageGet(["accessToken"]);
  return data.accessToken || "";
}

function setMessage(text, isError = false) {
  els.messageBox.textContent = text || "";
  els.messageBox.style.color = isError ? "#fecaca" : "#94a3b8";
}

async function uploadResume() {
  const file = els.resumeFileInput.files[0];

  if (!file) {
    setMessage("Please select a PDF or DOCX resume.", true);
    return;
  }

  const validTypes = [".pdf", ".docx"];
  const lowerName = file.name.toLowerCase();

  if (!validTypes.some((ext) => lowerName.endsWith(ext))) {
    setMessage("Only PDF and DOCX files are supported.", true);
    return;
  }

  try {
    els.uploadBtn.disabled = true;
    els.uploadBtn.textContent = "Uploading...";
    setMessage("Uploading and parsing resume...");

    const apiBase = await getApiBase();
    const token = await getToken();

    if (!token) {
      throw new Error("Please login from extension popup first.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${apiBase}/resume/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || "Resume upload failed");
    }

    els.resumeText.value = data.extracted_text || "";
    setMessage("Resume uploaded and synced to profile successfully.");
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    els.uploadBtn.disabled = false;
    els.uploadBtn.textContent = "Upload & Parse";
  }
}

async function copyText() {
  const text = els.resumeText.value.trim();

  if (!text) {
    setMessage("No resume text to copy.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setMessage("Resume text copied.");
  } catch {
    setMessage("Copy failed. Select text manually and copy.", true);
  }
}

function clearAll() {
  els.resumeFileInput.value = "";
  els.resumeText.value = "";
  setMessage("");
}

function bindEvents() {
  els.uploadBtn.addEventListener("click", uploadResume);
  els.copyBtn.addEventListener("click", copyText);
  els.clearBtn.addEventListener("click", clearAll);

  els.settingsBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_OPTIONS" });
  });

  els.openProfileBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_OPTIONS" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
});