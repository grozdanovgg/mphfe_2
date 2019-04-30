import { Observable } from "rxjs";
import Pool from "../../../models/Pool";
import Tab from "../../../models/Tab";

export default class ChromeService {

    // static injectScriptInTab(scriptSrc: string, data: {}, tabId): Observable<Pool> {
    //     return Observable.create(observer => {
    //         chrome.tabs.executeScript(
    //             tabId,
    //             { file: scriptSrc },
    //             result => {
    //                 ChromeService.sendDataToTab(tabId, data)
    //                     .subscribe(result => {
    //                         observer.next(result);
    //                         observer.complete();
    //                     })
    //             }
    //         );
    //     });
    // }

    // static sendDataToTab(tabId, data: {}): Observable<void> {
    //     return Observable.create(observer => {
    //         chrome.tabs.sendMessage(tabId, data, response => {
    //             observer.next(response);
    //             observer.complete();
    //         });
    //     });
    // }

    static getTabByUrl(url): Observable<Tab> {
        return Observable.create(observer => {
            chrome.tabs.query({}, (tabs: Tab[]) => {
                const tabFound: Tab = tabs.find(tab => {
                    return tab.url === url;
                });
                if (tabFound) {
                    observer.next(tabFound);
                    observer.complete();
                } else {
                    observer.error(`Tab with url ${url} not found`);
                }
            });
        });
    }

    static getTabs(): Observable<Tab[]> {
        return Observable.create(observer => {
            chrome.tabs.query({}, (tabs: Tab[]) => {
                if (tabs && tabs.length) {
                    observer.next(tabs);
                    observer.complete();
                } else {
                    observer.error('No tabs found');
                }
            });
        });
    }
}