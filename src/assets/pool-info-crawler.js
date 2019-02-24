// @ts-ignore

console.log('IN POOL INFO CONTENT');
chrome.runtime.onMessage.addListener((pool, sender, sendResponse) => {

    console.log('RECIEVED MESSAGE');
    console.log(pool);

    // @ts-ignore
    const speedTextGh = document.querySelector(pool.speedHTMLSelector).textContent;
    pool.speedTextGh = speedTextGh;
    sendResponse(pool);
});