// @ts-ignore

console.log('IN POOL INFO CONTENT');
chrome.runtime.onMessage.addListener((pool, sender, sendResponse) => {

    console.log('RECIEVED MESSAGE');
    console.log(pool);

    // @ts-ignore
    const poolSpeed = document.querySelector(pool.poolSpeedHTMLSelector).textContent;
    pool.poolSpeed = poolSpeed;
    sendResponse(pool);
});