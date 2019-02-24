// @ts-ignore

console.log('IN CONTENT');
chrome.runtime.onMessage.addListener((pool, sender, sendResponse) => {

    console.log('RECIEVED MESSAGE');
    console.log(pool);

    // @ts-ignore
    const blockNumber = document.querySelector(pool.lastBlockHTMLSelector).textContent;
    const blockTimePassedText = document.querySelector(pool.blockTimeHtmlSelector).textContent;
    pool.blockNumber = blockNumber;
    pool.blockTimePassedText = blockTimePassedText;
    sendResponse(pool);
});