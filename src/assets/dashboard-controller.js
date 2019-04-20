chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    // TODO put the logic to set the best pool

    // const blockNumber = document.querySelector(data.pool.lastBlockHTMLSelector).textContent;
    // const blockTimePassedText = document.querySelector(data.pool.blockTimeHtmlSelector).textContent;
    // data.pool.blockNumber = blockNumber;
    // data.pool.blockTimePassedText = blockTimePassedText;

    // sendResponse(data.pool);

    const checkboxAllRigsSelector = document.querySelector(data.dashboardController.checkboxAllRigsSelector);
    console.log(checkboxAllRigsSelector);
});
