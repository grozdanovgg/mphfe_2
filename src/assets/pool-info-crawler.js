chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {

    const speedTextGh = document.querySelector(data.pool.speedHTMLSelector).textContent;
    data.pool.speedTextGh = speedTextGh;

    sendResponse(data.pool);
});