const API_DEFAULT = "http://127.0.0.1:8000/api/v1";

const els = {
  savedJobsBtn: document.getElementById("savedJobsBtn"),
  generateBtn: document.getElementById("generateBtn"),
  copyBtn: document.getElementById("copyBtn"),
  clearBtn: document.getElementById("clearBtn"),
  coverLetterText: document.getElementById("coverLetterText"),
  messageBox: document.getElementById("messageBox")
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

function getJobIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("job_id");
}

async function apiRequest(path, options = {}) {
  const apiBase = await getApiBase();
  const token = await getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail || data?.message || "Request failed";
    throw new Error(Array.isArray(detail) ? detail[0]?.msg || "Validation error" : detail);
  }

  return data;
}

async function generateCoverLetter() {
  const jobId = getJobIdFromUrl();

  if (!jobId) {
    setMessage("Job ID not found. Open cover letter from Saved Jobs.", true);
    return;
  }

  try {
    els.generateBtn.disabled = true;
    els.generateBtn.textContent = "Generating...";
    setMessage("Generating cover letter...");

    const data = await apiRequest(`/cover-letters/generate/${jobId}`, {
      method: "POST"
    });

    els.coverLetterText.value = data.generated_text || "";
    setMessage("Cover letter generated successfully.");
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    els.generateBtn.disabled = false;
    els.generateBtn.textContent = "Generate";
  }
}

async function copyCoverLetter() {
  const text = els.coverLetterText.value.trim();

  if (!text) {
    setMessage("No cover letter to copy.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setMessage("Cover letter copied.");
  } catch {
    setMessage("Copy failed. Select text manually and copy.", true);
  }
}

function clearCoverLetter() {
  els.coverLetterText.value = "";
  setMessage("");
}

function bindEvents() {
  els.generateBtn.addEventListener("click", generateCoverLetter);
  els.copyBtn.addEventListener("click", copyCoverLetter);
  els.clearBtn.addEventListener("click", clearCoverLetter);

  els.savedJobsBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_SAVED" });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();

  if (getJobIdFromUrl()) {
    await generateCoverLetter();
  } else {
    setMessage("Open this page from a saved job to generate cover letter.", true);
  }
});