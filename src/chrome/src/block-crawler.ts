console.log('Script injected');
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  console.log('Init response from webpage:');

  const blockNumber = document.querySelector(data.lastBlockHTMLSelector)
    .textContent;
  const blockTimePassedText = document.querySelector(data.blockTimeHtmlSelector)
    .textContent;
  data.blockNumber = blockNumber;
  data.blockTimePassedText = blockTimePassedText;

  console.log('sending response from webpage:');
  console.log(data);
  sendResponse(data);
});
