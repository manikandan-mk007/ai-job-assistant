const API_DEFAULT = "http://127.0.0.1:8000/api/v1";

let allJobs = [];

const els = {
  settingsBtn: document.getElementById("settingsBtn"),
  refreshBtn: document.getElementById("refreshBtn"),

  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  scoreFilter: document.getElementById("scoreFilter"),

  messageBox: document.getElementById("messageBox"),
  jobsList: document.getElementById("jobsList"),

  totalJobs: document.getElementById("totalJobs"),
  averageScore: document.getElementById("averageScore"),
  strongMatches: document.getElementById("strongMatches"),
  appliedJobs: document.getElementById("appliedJobs")
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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text || "");
  return div.innerHTML;
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
  return `${Math.round(Number(value || 0))}%`;
}

function showMessage(text, isError = false) {
  els.messageBox.textContent = text;
  els.messageBox.style.color = isError ? "#fecaca" : "#94a3b8";
  els.messageBox.classList.remove("hidden");
}

function hideMessage() {
  els.messageBox.classList.add("hidden");
  els.messageBox.textContent = "";
}

function scoreDegrees(score) {
  const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
  return Math.round((safeScore / 100) * 360);
}

function getFilteredJobs() {
  const query = els.searchInput.value.trim().toLowerCase();
  const status = els.statusFilter.value;
  const scoreType = els.scoreFilter.value;

  return allJobs.filter((job) => {
    const searchable = [
      job.title,
      job.company,
      job.location,
      job.source,
      job.matched_skills,
      job.missing_skills,
      job.priority_skills,
      job.recommendation
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || searchable.includes(query);
    const matchesStatus = !status || job.status === status;

    const score = Number(job.final_score || 0);
    let matchesScore = true;

    if (scoreType === "strong") matchesScore = score >= 75;
    if (scoreType === "moderate") matchesScore = score >= 55 && score < 75;
    if (scoreType === "low") matchesScore = score < 55;

    return matchesQuery && matchesStatus && matchesScore;
  });
}

function renderStats(jobs) {
  const total = jobs.length;
  const scores = jobs.map((job) => Number(job.final_score || 0));

  const avg = scores.length
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;

  els.totalJobs.textContent = total;
  els.averageScore.textContent = percent(avg);
  els.strongMatches.textContent = jobs.filter((job) => Number(job.final_score || 0) >= 75).length;
  els.appliedJobs.textContent = jobs.filter((job) => job.status === "applied").length;
}

function renderChips(items, warn = false) {
  const list = normalizeArray(items).slice(0, 8);

  if (!list.length) {
    return `<span class="chip ${warn ? "warn" : ""}">No data</span>`;
  }

  return list
    .map((item) => `<span class="chip ${warn ? "warn" : ""}">${escapeHtml(item)}</span>`)
    .join("");
}

function renderJobs() {
  const jobs = getFilteredJobs();

  renderStats(jobs);

  if (!jobs.length) {
    els.jobsList.innerHTML = `
      <div class="empty">
        <h3>No saved jobs found</h3>
        <p>Analyze and save jobs from LinkedIn, Indeed, Naukri, or Glassdoor.</p>
      </div>
    `;
    return;
  }

  els.jobsList.innerHTML = jobs
    .map((job) => {
      const score = Number(job.final_score || 0);
      const degrees = scoreDegrees(score);
      const url = job.url || "#";

      return `
        <article class="job-card" data-id="${job.id}">
          <div class="job-top">
            <div>
              <h2 class="job-title">${escapeHtml(job.title)}</h2>
              <p class="company-line">
                ${escapeHtml(job.company)} • ${escapeHtml(job.location || "Location not found")}
              </p>
            </div>

            <div
              class="score-badge"
              style="background:
                radial-gradient(circle at center, #0f172a 58%, transparent 60%),
                conic-gradient(#38bdf8 ${degrees}deg, rgba(148, 163, 184, 0.20) ${degrees}deg);"
            >
              ${percent(score)}
            </div>
          </div>

          <div class="meta-row">
            <span class="meta-pill">${escapeHtml(job.status || "saved")}</span>
            <span class="meta-pill">${escapeHtml(job.source || "Unknown Source")}</span>
            <span class="meta-pill">${escapeHtml(job.recommendation || "Recommendation")}</span>
            <span class="meta-pill">Semantic ${percent(job.semantic_score)}</span>
            <span class="meta-pill">Skills ${percent(job.skill_score)}</span>
          </div>

          <p class="summary">${escapeHtml(job.match_summary || job.recommendation || "No summary available.")}</p>

          <div class="card-section">
            <h4>Matched Skills</h4>
            <div class="chips">${renderChips(job.matched_skills)}</div>
          </div>

          <div class="card-section">
            <h4>Priority / Missing Skills</h4>
            <div class="chips">
              ${renderChips(job.priority_skills || job.missing_skills, true)}
            </div>
          </div>

          <div class="job-actions">
            <select class="input select status-select" data-action="status" data-id="${job.id}">
              <option value="saved" ${job.status === "saved" ? "selected" : ""}>Saved</option>
              <option value="applied" ${job.status === "applied" ? "selected" : ""}>Applied</option>
              <option value="interview" ${job.status === "interview" ? "selected" : ""}>Interview</option>
              <option value="rejected" ${job.status === "rejected" ? "selected" : ""}>Rejected</option>
            </select>

            <button class="btn secondary" data-action="open" data-url="${escapeHtml(url)}">Open Job</button>
            <button class="btn primary" data-action="cover" data-id="${job.id}">Cover Letter</button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadJobs() {
  hideMessage();
  showMessage("Loading saved jobs...");

  try {
    allJobs = await apiRequest("/jobs");
    hideMessage();
    renderJobs();
  } catch (error) {
    showMessage(error.message, true);
  }
}

async function updateStatus(jobId, status) {
  try {
    await apiRequest(`/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });

    const job = allJobs.find((item) => String(item.id) === String(jobId));
    if (job) job.status = status;

    renderJobs();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function bindEvents() {
  els.settingsBtn.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "OPEN_OPTIONS" });
  });

  els.refreshBtn.addEventListener("click", loadJobs);

  els.searchInput.addEventListener("input", renderJobs);
  els.statusFilter.addEventListener("change", renderJobs);
  els.scoreFilter.addEventListener("change", renderJobs);

  els.jobsList.addEventListener("change", (event) => {
    const target = event.target;

    if (target.dataset.action === "status") {
      updateStatus(target.dataset.id, target.value);
    }
  });

  els.jobsList.addEventListener("click", (event) => {
    const target = event.target;

    if (target.dataset.action === "open") {
      browser.tabs.create({ url: target.dataset.url });
    }

    if (target.dataset.action === "cover") {
      browser.runtime.sendMessage({
        type: "OPEN_COVER_LETTER",
        jobId: target.dataset.id
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await loadJobs();
});