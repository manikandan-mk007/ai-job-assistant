browser.runtime.onInstalled.addListener(() => {
  console.log("AI Job Assistant V4 installed");
});

browser.runtime.onMessage.addListener((message) => {
  if (!message || !message.type) return;

  if (message.type === "OPEN_OPTIONS") {
    browser.runtime.openOptionsPage();
    return;
  }

  if (message.type === "OPEN_SAVED") {
    browser.tabs.create({
      url: browser.runtime.getURL("saved/saved.html")
    });
    return;
  }

  if (message.type === "OPEN_RESUME") {
    browser.tabs.create({
      url: browser.runtime.getURL("resume/resume.html")
    });
    return;
  }

  if (message.type === "OPEN_COVER_LETTER" && message.jobId) {
    browser.tabs.create({
      url: browser.runtime.getURL(
        `cover-letter/cover-letter.html?job_id=${message.jobId}`
      )
    });
  }
});