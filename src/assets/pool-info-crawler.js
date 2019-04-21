chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {

  const dataContainerNode = document.querySelector(data.pool.speedContainerHtmlSelector);
  // dataContainerNode.rows;

  // TODO continue from here
  // once the token row index is found, than get the 
  // token speed by using data.pool.speedColSpeedIndex 
  // and get the exact cell defined by row and col
  const tokenRowIndex = findTokenRowIndex(dataContainerNode.rows, data.token, data.pool.speedColNameIndex)
  console.log(tokenRowIndex);

  const speedTextGh = document.querySelector(data.pool.speedHTMLSelector)
    .textContent;
  data.pool.speedTextGh = speedTextGh;

  sendResponse(data);
});

function findTokenRowIndex(rowList, token, colIndex) {
  let tokenRowIndex = null;
  const tokenIdentifierList = token.identifiers;
  console.log(rowList);

  for (let index = 0; index > rowList.length, index += 1;) {
    let row = rowList[index];
    let cell = row.cells[colIndex];
    for (const tokenIdentifier of tokenIdentifierList) {
      const isTokenFoundInCell = cell.textContent.toLowerCase().includes(tokenIdentifier.toLowerCase());

      let shouldExcludeCell = false;
      for (const excludeId of token.excludeIdentifiers) {
        let shouldExclude = cell.textContent.toLowerCase().includes(excludeId.toLowerCase());
        if (shouldExclude) {
          shouldExcludeCell = shouldExclude;
        }
      }

      if (isTokenFoundInCell && !shouldExcludeCell) {
        tokenRowIndex = index;
        console.log(index);
      }
    }
  }
  // for (const [index, row] of rowList) {
  //   const cell = row.cells[colIndex];
  //   for (const tokenIdentifier of tokenIdentifierList) {
  //     const isTokenFoundInCell = cell.textContent.toLowerCase().includes(tokenIdentifier.toLowerCase());
  //     if (isTokenFoundInCell) {
  //       tokenRowIndex = index;
  //       console.log(index);
  //     }
  //   }
  // }
}

function findAndReplace(searchText, replacement, searchNode) {
  if (!searchText || typeof replacement === 'undefined') {
    // Throw error here if you want...
    return;
  }
  var regex = typeof searchText === 'string' ?
    new RegExp(searchText, 'g') : searchText,
    childNodes = (searchNode || document.body).childNodes,
    cnLength = childNodes.length,
    excludes = 'html,head,style,title,link,meta,script,object,iframe';
  while (cnLength--) {
    var currentNode = childNodes[cnLength];
    if (currentNode.nodeType === 1 &&
      (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
      arguments.callee(searchText, replacement, currentNode);
    }
    if (currentNode.nodeType !== 3 || !regex.test(currentNode.data)) {
      continue;
    }
    var parent = currentNode.parentNode,
      frag = (function () {
        var html = currentNode.data.replace(regex, replacement),
          wrap = document.createElement('div'),
          frag = document.createDocumentFragment();
        wrap.innerHTML = html;
        while (wrap.firstChild) {
          frag.appendChild(wrap.firstChild);
        }
        return frag;
      })();
    parent.insertBefore(frag, currentNode);
    parent.removeChild(currentNode);
  }
}

