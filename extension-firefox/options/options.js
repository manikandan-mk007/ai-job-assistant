const API_DEFAULT = "http://127.0.0.1:8000/api/v1";

const els = {
  apiBaseInput: document.getElementById("apiBaseInput"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  settingsMessage: document.getElementById("settingsMessage"),

  accountBox: document.getElementById("accountBox"),
  logoutBtn: document.getElementById("logoutBtn"),
  savedJobsBtn: document.getElementById("savedJobsBtn"),

  targetRoleInput: document.getElementById("targetRoleInput"),
  skillsInput: document.getElementById("skillsInput"),
  summaryInput: document.getElementById("summaryInput"),
  educationInput: document.getElementById("educationInput"),
  projectsInput: document.getElementById("projectsInput"),
  resumeTextInput: document.getElementById("resumeTextInput"),

  loadProfileBtn: document.getElementById("loadProfileBtn"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  profileMessage: document.getElementById("profileMessage")
};

function storageGet(keys) {
  return browser.storage.local.get(keys);
}

function storageSet(data) {
  return browser.storage.local.set(data);
}

function storageRemove(keys) {
  return browser.storage.local.remove(keys);
}

async function getApiBase() {
  const data = await storageGet(["apiBase"]);
  return data.apiBase || API_DEFAULT;
}

async function getToken() {
  const data = await storageGet(["accessToken"]);
  return data.accessToken || "";
}

function setText(el, text, isError = false) {
  el.textContent = text || "";
  el.style.color = isError ? "#fecaca" : "#94a3b8";
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

async function loadSettings() {
  els.apiBaseInput.value = await getApiBase();
}

async function saveSettings() {
  const apiBase = els.apiBaseInput.value.trim().replace(/\/$/, "");

  if (!apiBase) {
    setText(els.settingsMessage, "API Base URL is required", true);
    return;
  }

  await storageSet({ apiBase });
  setText(els.settingsMessage, "Settings saved successfully");
}

async function loadAccount() {
  try {
    const user = await apiRequest("/auth/me");

    els.accountBox.innerHTML = `
      <p class="account-name">${escapeHtml(user.name || "User")}</p>
      <p class="account-email">${escapeHtml(user.email || "")}</p>
    `;
  } catch {
    els.accountBox.innerHTML = `<p class="muted">Not logged in. Login from extension popup.</p>`;
  }
}

async function loadProfile() {
  setText(els.profileMessage, "Loading profile...");

  try {
    const profile = await apiRequest("/profiles/me");

    if (!profile) {
      setText(els.profileMessage, "No profile found. Create your profile.");
      return;
    }

    els.targetRoleInput.value = profile.target_role || "";
    els.skillsInput.value = profile.skills || "";
    els.summaryInput.value = profile.summary || "";
    els.educationInput.value = profile.education || "";
    els.projectsInput.value = profile.projects || "";
    els.resumeTextInput.value = profile.resume_text || "";

    setText(els.profileMessage, "Profile loaded");
  } catch (error) {
    setText(els.profileMessage, error.message, true);
  }
}

async function saveProfile() {
  setText(els.profileMessage, "Saving profile...");

  try {
    await apiRequest("/profiles/me", {
      method: "POST",
      body: JSON.stringify({
        target_role: els.targetRoleInput.value.trim(),
        skills: els.skillsInput.value.trim(),
        summary: els.summaryInput.value.trim(),
        education: els.educationInput.value.trim(),
        projects: els.projectsInput.value.trim(),
        resume_text: els.resumeTextInput.value.trim()
      })
    });

    setText(els.profileMessage, "Profile saved successfully");
  } catch (error) {
    setText(els.profileMessage, error.message, true);
  }
}

async function logout() {
  await storageRemove(["accessToken"]);
  els.accountBox.innerHTML = `<p class="muted">Logged out. Login again from popup.</p>`;
  setText(els.profileMessage, "");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text || "");
  return div.innerHTML;
}

function bindEvents() {
  els.saveSettingsBtn.addEventListener("click", saveSettings);
  els.loadProfileBtn.addEventListener("click", loadProfile);
  els.saveProfileBtn.addEventListener("click", saveProfile);
  els.logoutBtn.addEventListener("click", logout);

  els.savedJobsBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_SAVED" });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadSettings();
  await loadAccount();
  await loadProfile();
});