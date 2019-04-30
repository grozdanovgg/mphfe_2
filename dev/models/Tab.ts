import { Observable, PartialObserver } from "rxjs";
import Pool from "./Pool";

export default class Tab {
    active: boolean;
    audible: boolean;
    autoDiscardable: boolean;
    discarded: boolean;
    favIconUrl: string;
    height: number;
    highlighted: boolean;
    id: number;
    incognito: boolean;
    index: number;
    mutedInfo: { muted: boolean };
    pinned: boolean;
    selected: boolean;
    status: string;
    title: string;
    url: string;
    width: number;
    windowId: number;

    reload(): Observable<void> {
        return Observable.create((observer: PartialObserver<void>) => {
            chrome.tabs.reload(this.id, null, () => {
                observer.next();
                observer.complete();
            });
        });
    }

    injectScript(scriptSrc: string, data: {}): Observable<Pool> {
        return Observable.create(observer => {
            chrome.tabs.executeScript(
                this.id,
                { file: scriptSrc },
                result => {
                    this.sendData(data)
                        .subscribe(result => {
                            observer.next(result);
                            observer.complete();
                        })
                }
            );
        });
    }

    sendData(data: {}): Observable<void> {
        return Observable.create(observer => {
            chrome.tabs.sendMessage(this.id, data, response => {
                observer.next(response);
                observer.complete();
            });
        });
    }
}
