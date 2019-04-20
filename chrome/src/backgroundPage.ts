import ITab from './models/ITab';
import { Observable, forkJoin } from 'rxjs';
import IPool from './models/IPool';
import { map } from 'rxjs/operators';
import IToken from './models/IToken';
import IDashboard from './models/IDashboard';

// TODO get ths info dynamically
const ravenToken = {
    name: 'RavenCoin',
    averageBlockIntervalMin: 1,
    globalHashrateGh: 3260
};

// TODO do not hardcode this
const dashboardController: IDashboard = {
    url: 'https://simplemining.net/account/rigs',
    checkboxAllRigsSelector: '#data-table-rigs > thead > tr > th:nth-child(1) > div.th-inner > input',
    assignGroupBtnHtmlId: 'buttonUserGroup'
};

console.log('IN BACKGROUND');

export class BackgroundComponent {
    activePool: IPool;
    reloadIntevalSec = 10 * 1000;
    bufferCrawlSec = 5 * 1000;
    dashboardControllerInjected = false;

    constructor() { }

    ngOnInit() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.inject) {
                this.injectScripts(message.inject);

                setInterval(() => {
                    this.injectScripts(message.inject);
                }, this.reloadIntevalSec);
            }
        });
    }

    private injectScripts(pools: IPool[]) {
        chrome.tabs.query({}, (tabs: ITab[]) => {
            const crawlingPools: Observable<IPool>[] = [];
            const poolTabs: ITab[] = [];

            for (const pool of pools) {
                const poolBlocksTab: ITab = tabs.find(tab => {
                    return tab.url === pool.lastBlockUrl;
                });
                const poolInfoTab: ITab = tabs.find(tab => {
                    return tab.url === pool.speedUrl;
                });

                if (!poolBlocksTab || !poolInfoTab) {
                    console.log('NO TAB FOUND ERR - TO HANDLE');
                    console.log('Pool:');
                    console.log(pool);
                    console.log('TabFound:');
                    console.log(poolBlocksTab);
                    console.log('poolTabFound:');
                    console.log(poolInfoTab);
                    return;
                }

                chrome.tabs.reload(poolBlocksTab.id, null, () => {
                    const blockCrawlerSubscr: Observable<IPool> = this.injectScriptInTab(
                        'assets/block-crawler.js',
                        pool,
                        poolBlocksTab.id
                    );
                    crawlingPools.push(blockCrawlerSubscr);
                });

                chrome.tabs.reload(poolInfoTab.id, null, () => {
                    const poolCrawlerSubscr: Observable<IPool> = this.injectScriptInTab(
                        'assets/pool-info-crawler.js',
                        pool,
                        poolInfoTab.id
                    );
                    crawlingPools.push(poolCrawlerSubscr);
                });
            }

            setTimeout(() => {
                forkJoin(crawlingPools)
                    .pipe(
                        map(this.mergeDataByPool.bind(this)),
                        map(this.sanitizePools.bind(this))
                    )
                    .subscribe(
                        (poolsData: { [key: string]: IPool }) => {
                            // poolsData = this.sanitizePools(poolsData);

                            // Best pool found
                            const bestPool = this.getBestPool(poolsData, ravenToken);
                            console.log(bestPool);
                            if (bestPool !== this.activePool) {
                                this.setActivePool(bestPool);
                                this.activePool = bestPool;
                            }
                        },
                        error => {
                            console.log(error);
                        }
                    );
            }, this.bufferCrawlSec);
        });
    }

    private injectScriptInTab(scriptSrc: string, data: {}, tabId): Observable<IPool> {
        return Observable.create(observer => {
            chrome.tabs.executeScript(
                tabId,
                { file: scriptSrc },
                result => {
                    this.sendDataToTab(tabId, data)
                        .subscribe(result => {
                            observer.next(result);
                            observer.complete();
                        })
                }
            );
        });
    }

    private sendDataToTab(tabId, data: {}): Observable<void> {
        return Observable.create(observer => {
            chrome.tabs.sendMessage(tabId, data, response => {
                observer.next(response);
                observer.complete();
            });
        });
    }

    private setActivePool(pool: IPool): any {
        this.findTabWithUrl(dashboardController.url)
            // .pipe(
            //   tap((tab: ITab) => { }),
            //   tap(() => { })
            // )
            .subscribe((tab: ITab) => {
                if (!this.dashboardControllerInjected) {
                    this.injectScriptInTab(
                        'assets/dashboard-controller.js',
                        { pool, dashboardController },
                        tab.id
                    ).subscribe(() => {
                        this.dashboardControllerInjected = true;
                    });
                } else {
                    this.sendDataToTab(tab.id, { pool, dashboardController });
                }
            });
    }

    private findTabWithUrl(url): Observable<ITab> {
        return Observable.create(observer => {
            chrome.tabs.query({}, (tabs: ITab[]) => {
                const tabFound: ITab = tabs.find(tab => {
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

    private sanitizePools(pools: { [key: string]: IPool }) {
        for (const key in pools) {
            if (pools.hasOwnProperty(key)) {
                const stringDigits = pools[key].speedTextGh.split(' ')[0];
                pools[key].speedGh = +stringDigits;

                if (pools[key].blockTimePassedText) {
                    const timeNumber = +pools[key].blockTimePassedText.match(/\d+/)[0];
                    const timePeriod =
                        pools[key].blockTimePassedText[
                        pools[key].blockTimePassedText.length - 1
                        ];
                    const multiplier = this.getTimeMultiplier(timePeriod);
                    pools[key].blockTimePassedMin = timeNumber * multiplier;
                } else {
                    pools[key].blockTimePassedMin = 0;
                }
            }
        }
        return pools;
    }

    private mergeDataByPool(poolsMixedData: IPool[]): { [key: string]: IPool } {
        const savedPools = {};
        for (const pool of poolsMixedData) {
            if (!savedPools[pool.name]) {
                savedPools[pool.name] = pool;
            } else {
                savedPools[pool.name] = { ...savedPools[pool.name], ...pool };
            }
        }

        return savedPools;
    }

    private getTimeMultiplier(timePeriod: string) {
        switch (timePeriod) {
            case '2':
                return 7 * 24 * 60;

            case 'd':
                return 24 * 60;

            case 'h':
                return 60;

            case 'm':
                return 1;

            case 's':
                return 0.0167;

            default:
                return 0;
        }
    }

    private getBestPool(pools: { [key: string]: IPool }, token: IToken): IPool {
        let bestPool: IPool = { score: 0 };
        for (const key in pools) {
            if (pools.hasOwnProperty(key)) {
                pools[key] = this.calcPoolScore(pools[key], token);
                if (pools[key].score > bestPool.score) {
                    bestPool = pools[key];
                }
            }
        }

        // for (const key in pools) {
        //     console.log(pools[key].name, pools[key].score);
        // }

        return bestPool;
    }

    private calcPoolScore(pool: IPool, token: IToken): IPool {
        pool.averageBlockIntervalMin = this.calcAverageBlockInterval(pool, token);
        pool.score = pool.averageBlockIntervalMin / pool.blockTimePassedMin;

        console.log(pool.name, pool.blockTimePassedMin, pool.averageBlockIntervalMin);
        console.log(pool.name, pool.score);
        return pool;
    }

    private calcAverageBlockInterval(pool: IPool, token: IToken): number {
        const result =
            (token.globalHashrateGh * token.averageBlockIntervalMin) / pool.speedGh;

        console.log(pool.name, 'Average Block Interval', token.globalHashrateGh, token.averageBlockIntervalMin, pool.speedGh);

        return result;
    }
}

new BackgroundComponent().ngOnInit();
