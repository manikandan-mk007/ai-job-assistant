console.log("AI Job Assistant content loaded:", window.location.href);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTextFromSelectors(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = cleanText(el?.innerText || el?.textContent || "");
    if (text) return text;
  }

  return "";
}

function clickExpandableButtons() {
  const safeButtons = Array.from(document.querySelectorAll("button"));

  safeButtons.forEach((btn) => {
    const text = cleanText(
      btn.innerText ||
      btn.textContent ||
      btn.getAttribute("aria-label") ||
      ""
    ).toLowerCase();

    const isSafeExpand =
      text === "see more" ||
      text === "show more" ||
      text === "read more" ||
      text.includes("show more");

    if (isSafeExpand) {
      try {
        btn.click();
      } catch (error) {
        console.warn("Safe expand failed:", error);
      }
    }
  });
}

function detectSource() {
  const host = window.location.hostname.toLowerCase();

  if (host.includes("linkedin")) return "LinkedIn";
  if (host.includes("indeed")) return "Indeed";
  if (host.includes("naukri")) return "Naukri";
  if (host.includes("glassdoor")) return "Glassdoor";

  return "Unknown";
}

function getLargeJobDescriptionBlock() {
  const possibleBlocks = Array.from(
    document.querySelectorAll("section, article, main, div")
  )
    .map((el) => cleanText(el.innerText || el.textContent || ""))
    .filter((text) => text.length > 70)
    .filter((text) => {
      const lower = text.toLowerCase();
      return (
        lower.includes("about the job") ||
        lower.includes("job description") ||
        lower.includes("requirements") ||
        lower.includes("responsibilities") ||
        lower.includes("qualifications") ||
        lower.includes("skills") ||
        lower.includes("experience") ||
        lower.includes("location:") ||
        lower.includes("type:")
      );
    });

  return possibleBlocks.sort((a, b) => b.length - a.length)[0] || "";
}

function extractLinkedIn() {
  const title = getTextFromSelectors([
    "h1",
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-unified-top-card__job-title",
    ".t-24"
  ]);

  const company = getTextFromSelectors([
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name",
    "a[href*='/company/']"
  ]);

  const location = getTextFromSelectors([
    ".job-details-jobs-unified-top-card__bullet",
    ".jobs-unified-top-card__bullet",
    ".job-details-jobs-unified-top-card__primary-description-container",
    ".jobs-unified-top-card__subtitle-primary-grouping"
  ]);

  const description =
    getTextFromSelectors([
      "#job-details",
      ".jobs-description",
      ".jobs-description__content",
      ".jobs-box__html-content",
      ".show-more-less-html__markup",
      ".jobs-description-content__text"
    ]) || getLargeJobDescriptionBlock();

  return { title, company, location, description };
}

function extractIndeed() {
  const title = getTextFromSelectors([
    "h1",
    "[data-testid='jobsearch-JobInfoHeader-title']",
    ".jobsearch-JobInfoHeader-title"
  ]);

  const company = getTextFromSelectors([
    "[data-testid='inlineHeader-companyName']",
    ".jobsearch-InlineCompanyRating div",
    "[data-company-name='true']"
  ]);

  const location = getTextFromSelectors([
    "[data-testid='job-location']",
    ".jobsearch-JobInfoHeader-subtitle div",
    "#jobLocationText"
  ]);

  const description =
    getTextFromSelectors([
      "#jobDescriptionText",
      "[data-testid='jobsearch-JobComponent-description']"
    ]) || getLargeJobDescriptionBlock();

  return { title, company, location, description };
}

function extractNaukri() {
  const title = getTextFromSelectors([
    "h1",
    ".styles_jd-header-title__rZwM1",
    ".jd-header-title",
    ".designation-title"
  ]);

  const company = getTextFromSelectors([
    ".styles_jd-header-comp-name__MvqAI",
    ".jd-header-comp-name",
    ".company-name"
  ]);

  const location = getTextFromSelectors([
    ".styles_jhc__location__W_pVs",
    ".location",
    ".loc"
  ]);

  const description =
    getTextFromSelectors([
      ".styles_JDC__dang-inner-html__h0K4t",
      ".job-desc",
      ".dang-inner-html",
      "section.styles_job-desc-container__txpYf"
    ]) || getLargeJobDescriptionBlock();

  return { title, company, location, description };
}

function extractGlassdoor() {
  const title = getTextFromSelectors([
    "h1",
    "[data-test='job-title']",
    ".JobDetails_jobTitle__Rw_gn"
  ]);

  const company = getTextFromSelectors([
    "[data-test='employer-name']",
    ".EmployerProfile_profileContainer__VjVBX",
    ".JobDetails_employerName__6aTgq"
  ]);

  const location = getTextFromSelectors([
    "[data-test='location']",
    ".JobDetails_location__MbnUM"
  ]);

  const description =
    getTextFromSelectors([
      "[data-test='jobDescriptionContent']",
      ".JobDetails_jobDescription__uW_fK",
      "#JobDescriptionContainer"
    ]) || getLargeJobDescriptionBlock();

  return { title, company, location, description };
}

async function extractJobData() {
  clickExpandableButtons();
  await sleep(900);

  const source = detectSource();
  let data = {};

  if (source === "LinkedIn") data = extractLinkedIn();
  else if (source === "Indeed") data = extractIndeed();
  else if (source === "Naukri") data = extractNaukri();
  else if (source === "Glassdoor") data = extractGlassdoor();
  else data = { description: getLargeJobDescriptionBlock() };

  return {
    title: cleanText(data.title) || "Unknown Job Title",
    company: cleanText(data.company) || "Unknown Company",
    location: cleanText(data.location) || "Location not found",
    description: cleanText(data.description),
    url: window.location.href,
    source
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.type === "GET_JOB_DATA") {
    extractJobData()
      .then((data) => sendResponse(data))
      .catch((error) => sendResponse({ error: error.message }));

    return true;
  }
});