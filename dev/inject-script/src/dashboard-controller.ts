// chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
//     // TODO put the logic to set the best pool

//     const checkboxAllRigsSelector = document.querySelector(data.dashboardController.checkboxAllRigsSelector);
//     console.log(checkboxAllRigsSelector);
// });

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    const groupToHop = data.pool.id;
    const selectAllCheckbox = document.querySelector(data.dashboardController.checkboxAllRigsSelector);
    const assignGroupBtn = document.getElementById(data.dashboardController.assignGroupBtnHtmlId);

    // handle bug, that when returning from group selection modal, the checkbox remains clicked
    // but it should not be. So uncheck it first.
    if (selectAllCheckbox && selectAllCheckbox.checked) {
        selectAllCheckbox.click();
    }

    selectAllCheckbox.click();
    assignGroupBtn.click();

    const groupSelectList = document.getElementById('userGroupId') as HTMLSelectElement;
    const groupSaveBtn = document.getElementsByClassName('btn-save-group')[0] as HTMLButtonElement;

    console.log(groupSelectList)
    if (groupSelectList) {

        let groupToActivateIndex;

        for (let i = 0; i < groupSelectList.length; i += 1) {

            if ((groupSelectList[i] as HTMLOptionElement).text.includes(groupToHop)) {
                groupToActivateIndex = i;
                break;
            }
        }
        console.log('groupToActivateIndex', groupToActivateIndex);
        groupSelectList.options.selectedIndex = groupToActivateIndex;

        if (groupSaveBtn && groupSaveBtn) {
            setTimeout(() => {
                groupSaveBtn.click();
            }, 1000);
        }
    }
});





// $('body').mousemove(function (event) {
//     // console.log(event)
//     $('.mphce-hover').removeClass('mphce-hover');
//     $(event.target).addClass('mphce-hover');
// });

// $(document).click(function (event) {
//     event.preventDefault();

//     const path = fullPath(event.target);
//     const el = $(path);
//     const text = $($(path)[0]).text();

//     // chrome.storage.sync.set({
//     //     type: 'selected-element',
//     //     elementSelector: path,
//     //     elementText: +text
//     // }, function () {
//     //     console.log('Value is set to ' + path);
//     //     console.log(+text);
//     // });
//     // $(document).unbind('click');
//     // $('body').unbind('mousemove');
//     // $('.mphce-hover').removeClass('mphce-hover');

//     // chrome.runtime.sendMessage({
//     //     type: 'selected-element',
//     //     elementSelector: path,
//     //     elementText: +text
//     // }, function (response) {
//     //     if (response) {
//     //         $(document).unbind('click');
//     //         $('body').unbind('mousemove');
//     //         $('.mphce-hover').removeClass('mphce-hover');
//     //     }
//     // });
// });



// // function fullPath(el: any) {
// //     const names = [];
// //     while (el.parentNode) {
// //         if (el.id) {
// //             names.unshift('#' + el.id);
// //             break;
// //         } else {
// //             if (el === el.ownerDocument.documentElement) names.unshift(el.tagName);
// //             else {
// //                 for (let c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++) {
// //                     names.unshift(el.tagName + ':nth-child(' + c + ')');
// //                 }
// //             }
// //             el = el.parentNode;
// //         }
// //     }
// //     return names.join(' > ');
// // }

// function fullPath(el: any): string {
//     if (!(el instanceof Element))
//         return '';
//     const path = [];
//     while (el.nodeType === Node.ELEMENT_NODE) {
//         let selector = el.nodeName.toLowerCase();
//         if (el.id) {
//             selector += '#' + el.id;
//             path.unshift(selector);
//             break;
//         } else {
//             let sib = el, nth = 1;
//             while (sib = sib.previousElementSibling) {
//                 if (sib.nodeName.toLowerCase() == selector)
//                     nth++;
//             }
//             // tslint:disable-next-line:triple-equals
//             if (nth != 1)
//                 selector += ':nth-of-type(' + nth + ')';
//         }
//         path.unshift(selector);
//         el = el.parentNode;
//     }
//     return path.join(' > ');
// }