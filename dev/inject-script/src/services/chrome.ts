import { Observable } from "rxjs";
import Pool from "../../../models/Pool";
import Tab from "../../../models/Tab";

export default class ChromeService {

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