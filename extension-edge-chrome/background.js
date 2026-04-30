chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Job Assistant V4 installed");
});

chrome.runtime.onMessage.addListener((message) => {
  if (!message || !message.type) return;

  if (message.type === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    return;
  }

  if (message.type === "OPEN_SAVED") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("saved/saved.html")
    });
    return;
  }

  if (message.type === "OPEN_RESUME") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("resume/resume.html")
    });
    return;
  }

  if (message.type === "OPEN_COVER_LETTER") {
    if (!message.jobId) return;

    chrome.tabs.create({
      url: chrome.runtime.getURL(
        "cover-letter/cover-letter.html?job_id=" + encodeURIComponent(message.jobId)
      )
    });
  }
});