const API_DEFAULT = "http://127.0.0.1:8000/api/v1";

let currentJobData = null;
let currentAnalysis = null;
let currentSavedJobId = null;

const els = {
  authBox: document.getElementById("authBox"),
  userBox: document.getElementById("userBox"),
  userName: document.getElementById("userName"),
  userEmail: document.getElementById("userEmail"),

  nameInput: document.getElementById("nameInput"),
  emailInput: document.getElementById("emailInput"),
  passwordInput: document.getElementById("passwordInput"),

  loginBtn: document.getElementById("loginBtn"),
  registerBtn: document.getElementById("registerBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  settingsBtn: document.getElementById("settingsBtn"),

  profileBtn: document.getElementById("profileBtn"),
  savedBtn: document.getElementById("savedBtn"),
  resumeBtn: document.getElementById("resumeBtn"),

  analyzeBtn: document.getElementById("analyzeBtn"),
  saveJobBtn: document.getElementById("saveJobBtn"),
  coverLetterBtn: document.getElementById("coverLetterBtn"),

  authMessage: document.getElementById("authMessage"),
  loadingBox: document.getElementById("loadingBox"),
  errorBox: document.getElementById("errorBox"),
  resultBox: document.getElementById("resultBox"),

  finalScore: document.getElementById("finalScore"),
  scoreRingText: document.getElementById("scoreRingText"),
  recommendation: document.getElementById("recommendation"),
  matchSummary: document.getElementById("matchSummary"),

  semanticScore: document.getElementById("semanticScore"),
  skillScore: document.getElementById("skillScore"),
  resumeScore: document.getElementById("resumeScore"),
  projectScore: document.getElementById("projectScore"),

  matchedCount: document.getElementById("matchedCount"),
  missingCount: document.getElementById("missingCount"),

  matchedSkills: document.getElementById("matchedSkills"),
  missingSkills: document.getElementById("missingSkills"),
  prioritySkills: document.getElementById("prioritySkills"),
  suggestedKeywords: document.getElementById("suggestedKeywords"),

  strengthsList: document.getElementById("strengthsList"),
  weaknessesList: document.getElementById("weaknessesList"),
  resumeTipsList: document.getElementById("resumeTipsList"),
  learningPlanList: document.getElementById("learningPlanList")
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

function setMessage(text, isError = false) {
  els.authMessage.textContent = text || "";
  els.authMessage.style.color = isError ? "#fecaca" : "#94a3b8";
}

function showError(message) {
  els.errorBox.textContent = message;
  els.errorBox.classList.remove("hidden");
}

function hideError() {
  els.errorBox.textContent = "";
  els.errorBox.classList.add("hidden");
}

function setLoading(isLoading) {
  els.loadingBox.classList.toggle("hidden", !isLoading);
  els.analyzeBtn.disabled = isLoading;
  els.saveJobBtn.disabled = isLoading;
}

function showResultBox(show) {
  els.resultBox.classList.toggle("hidden", !show);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function percent(value) {
  const num = Number(value || 0);
  return `${Math.round(num)}%`;
}

function renderChips(container, items, emptyText = "No data") {
  const list = normalizeArray(items);
  container.innerHTML = "";

  if (!list.length) {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = emptyText;
    container.appendChild(span);
    return;
  }

  list.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = item;
    container.appendChild(chip);
  });
}

function renderList(container, items, emptyText = "No suggestions available") {
  const list = normalizeArray(items);
  container.innerHTML = "";

  if (!list.length) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    container.appendChild(li);
    return;
  }

  list.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function updateScoreRing(score) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  const degrees = Math.round((safeScore / 100) * 360);

  document.querySelector(".score-ring").style.background =
    `radial-gradient(circle at center, #0f172a 58%, transparent 60%),
     conic-gradient(#38bdf8 ${degrees}deg, rgba(148, 163, 184, 0.20) ${degrees}deg)`;

  els.scoreRingText.textContent = Math.round(safeScore);
}

function renderAnalysis(result) {
  currentAnalysis = result;
  currentSavedJobId = null;

  const finalScore = Number(result.final_score || 0);

  els.finalScore.textContent = percent(finalScore);
  els.recommendation.textContent = result.recommendation || "AI recommendation";
  els.matchSummary.textContent = result.match_summary || result.recommendation || "Analysis completed.";

  els.semanticScore.textContent = percent(result.semantic_score);
  els.skillScore.textContent = percent(result.skill_score);
  els.resumeScore.textContent = percent(result.resume_score);
  els.projectScore.textContent = percent(result.project_score);

  const matched = normalizeArray(result.matched_skills);
  const missing = normalizeArray(result.missing_skills);

  els.matchedCount.textContent = matched.length;
  els.missingCount.textContent = missing.length;

  renderChips(els.matchedSkills, matched, "No matched skills");
  renderChips(els.missingSkills, missing, "No missing skills");
  renderChips(els.prioritySkills, result.priority_skills, "No priority skills");
  renderChips(els.suggestedKeywords, result.suggested_keywords, "No keywords");

  renderList(els.strengthsList, result.strengths, "No strengths detected");
  renderList(els.weaknessesList, result.weaknesses, "No weaknesses detected");
  renderList(els.resumeTipsList, result.resume_improvements, "Resume looks okay");
  renderList(els.learningPlanList, result.learning_plan, "No learning plan needed");

  updateScoreRing(finalScore);
  showResultBox(true);
}

async function loadUser() {
  const token = await getToken();

  if (!token) {
    els.authBox.classList.remove("hidden");
    els.userBox.classList.add("hidden");
    return;
  }

  try {
    const user = await apiRequest("/auth/me");
    els.userName.textContent = user.name || "User";
    els.userEmail.textContent = user.email || "";
    els.authBox.classList.add("hidden");
    els.userBox.classList.remove("hidden");
  } catch {
    await storageRemove(["accessToken"]);
    els.authBox.classList.remove("hidden");
    els.userBox.classList.add("hidden");
  }
}

async function login() {
  hideError();
  setMessage("Logging in...");

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: els.emailInput.value.trim(),
        password: els.passwordInput.value
      })
    });

    await storageSet({ accessToken: data.access_token });
    setMessage("Login successful");
    await loadUser();
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function register() {
  hideError();
  setMessage("Creating account...");

  try {
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: els.nameInput.value.trim(),
        email: els.emailInput.value.trim(),
        password: els.passwordInput.value
      })
    });

    setMessage("Account created. Logging in...");
    await login();
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function logout() {
  await storageRemove(["accessToken"]);
  currentAnalysis = null;
  currentJobData = null;
  currentSavedJobId = null;
  showResultBox(false);
  await loadUser();
}

async function getCurrentTab() {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0];
}

async function requestJobDataFromPage() {
  const tab = await getCurrentTab();

  if (!tab?.id) {
    throw new Error("No active tab found");
  }

  const response = await browser.tabs.sendMessage(tab.id, {
    type: "GET_JOB_DATA"
  });

  if (!response || !response.description || response.description.length < 40) {
    throw new Error("Could not extract job description. Open a valid LinkedIn, Indeed, Naukri, or Glassdoor job page.");
  }

  return response;
}

async function analyzeCurrentJob() {
  hideError();
  showResultBox(false);
  setLoading(true);

  try {
    currentJobData = await requestJobDataFromPage();

    const result = await apiRequest("/analysis/analyze-job", {
      method: "POST",
      body: JSON.stringify({
        title: currentJobData.title,
        company: currentJobData.company,
        location: currentJobData.location,
        url: currentJobData.url,
        description: currentJobData.description
      })
    });

    renderAnalysis(result);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

async function saveJob() {
  hideError();

  if (!currentJobData || !currentAnalysis) {
    showError("Analyze a job before saving.");
    return;
  }

  try {
    els.saveJobBtn.disabled = true;
    els.saveJobBtn.textContent = "Saving...";

    const saved = await apiRequest("/jobs/save", {
      method: "POST",
      body: JSON.stringify({
        title: currentJobData.title,
        company: currentJobData.company,
        location: currentJobData.location,
        url: currentJobData.url,
        description: currentJobData.description,
        source: currentJobData.source,

        extracted_skills: currentAnalysis.extracted_skills || [],
        matched_skills: currentAnalysis.matched_skills || [],
        missing_skills: currentAnalysis.missing_skills || [],
        priority_skills: currentAnalysis.priority_skills || [],
        suggested_keywords: currentAnalysis.suggested_keywords || [],

        semantic_score: currentAnalysis.semantic_score || 0,
        skill_score: currentAnalysis.skill_score || 0,
        role_score: currentAnalysis.role_score || 0,
        project_score: currentAnalysis.project_score || 0,
        resume_score: currentAnalysis.resume_score || 0,
        final_score: currentAnalysis.final_score || 0,

        recommendation: currentAnalysis.recommendation || "",
        match_summary: currentAnalysis.match_summary || "",
        strengths: currentAnalysis.strengths || [],
        weaknesses: currentAnalysis.weaknesses || [],
        resume_improvements: currentAnalysis.resume_improvements || [],
        learning_plan: currentAnalysis.learning_plan || [],
        cover_letter_points: currentAnalysis.cover_letter_points || []
      })
    });

    currentSavedJobId = saved.id;
    els.saveJobBtn.textContent = "Saved ✓";
  } catch (error) {
    showError(error.message);
    els.saveJobBtn.textContent = "Save Job";
  } finally {
    els.saveJobBtn.disabled = false;
  }
}

async function openCoverLetter() {
  if (!currentSavedJobId) {
    await saveJob();
  }

  if (currentSavedJobId) {
    browser.runtime.sendMessage({
      type: "OPEN_COVER_LETTER",
      jobId: currentSavedJobId
    });
  }
}

function bindEvents() {
  els.loginBtn.addEventListener("click", login);
  els.registerBtn.addEventListener("click", register);
  els.logoutBtn.addEventListener("click", logout);

  els.analyzeBtn.addEventListener("click", analyzeCurrentJob);
  els.saveJobBtn.addEventListener("click", saveJob);
  els.coverLetterBtn.addEventListener("click", openCoverLetter);

  els.settingsBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_OPTIONS" });
  });

  els.profileBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_OPTIONS" });
  });

  els.savedBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_SAVED" });
  });

  els.resumeBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_RESUME" });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadUser();
});