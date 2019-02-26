chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {

    const blockNumber = document.querySelector(data.pool.lastBlockHTMLSelector).textContent;
    const blockTimePassedText = document.querySelector(data.pool.blockTimeHtmlSelector).textContent;
    data.pool.blockNumber = blockNumber;
    data.pool.blockTimePassedText = blockTimePassedText;

    sendResponse(data.pool);
});


