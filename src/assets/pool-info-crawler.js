chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  const speedTextGh = document.querySelector(data.speedHTMLSelector)
    .textContent;
  data.speedTextGh = speedTextGh;

  sendResponse(data);
});
