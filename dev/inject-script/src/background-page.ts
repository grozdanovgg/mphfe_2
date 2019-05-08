import { Observable, forkJoin, Subscription } from 'rxjs';
import { map, concatMap, find, mergeMap } from 'rxjs/operators';
import Token from '../../models/Token';
import Dashboard from '../../models/Dashboard';
import Pool from '../../models/Pool';
import Tab from '../../models/Tab';
import ChromeService from './services/chrome';
import Scoring from './services/scoring';

// TODO get ths info dynamically
const ravenToken: Token = new Token({
    id: 'RavenCoin',
    identifiers: ['raven', 'rvn', 'ravencoin'],
    excludeIdentifiers: ['Dark'],
    averageBlockIntervalMin: 1.15,
    globalHashrateGh: 13000
});

// TODO do not hardcode this
const dashboardController = new Dashboard({
    url: 'https://simplemining.net/account/rigs',
    checkboxAllRigsSelector: '#data-table-rigs > thead > tr > th:nth-child(1) > div.th-inner > input',
    groupConfigSelectedSelector: '#data-table-rigs > tbody > tr.danger > td:nth-child(4)',
    assignGroupBtnHtmlId: 'buttonUserGroup'
});

console.log('IN BACKGROUND');

let activePool: Pool;
let reloadIntervalSec = 30 * 1000;
let bufferCrawlSec = 5 * 1000;
let dashboardControllerInjected = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.inject) {
        onStartClick(message.inject);

        setInterval(() => {
            onStartClick(message.inject);
        }, reloadIntervalSec);
    }
});


function onStartClick(pools: Pool[]): void {
    ChromeService.getTabs()
        .subscribe((tabs: Tab[]) => {
            const crawlingPools: Observable<Pool>[] = [];
            for (const pool of pools) {
                const poolBlocksTab: Tab = new Tab(tabs.find(tab => {
                    return tab.url === pool.lastBlockUrl;
                }));
                const poolInfoTab: Tab = new Tab(tabs.find(tab => {
                    return tab.url === pool.speedUrl;
                }));

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

                // function httpGetAsync(theUrl, callback) {
                //     var xmlHttp = new XMLHttpRequest();
                //     xmlHttp.onreadystatechange = function () {
                //         if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                //             callback(xmlHttp.responseText);
                //     }
                //     xmlHttp.open("GET", theUrl, true); // true for asynchronous 
                //     xmlHttp.send(null);
                // }

                // httpGetAsync('https://www.pickaxe.pro/site/current_results', result => {
                //     console.log(result);
                // });

                poolBlocksTab.reload()
                    .subscribe(() => {
                        const blockCrawlerSubscr: Observable<Pool> = poolBlocksTab
                            .injectScript('block-crawler.js', pool);

                        crawlingPools.push(blockCrawlerSubscr);
                    });

                poolInfoTab.reload()
                    .subscribe(() => {
                        const poolCrawlerSubscr: Observable<Pool> = poolInfoTab
                            .injectScript('pool-info-crawler.js', { pool, token: ravenToken });

                        crawlingPools.push(poolCrawlerSubscr);
                    });
            }

            setTimeout(() => {
                forkJoin(crawlingPools)
                    .pipe(
                        map(mergeDataByPool.bind(this)),
                        map(sanitizePools.bind(this))
                    )
                    .subscribe(
                        (poolsData: { [key: string]: Pool }) => {
                            const bestPool = Scoring.getBestPool(poolsData, ravenToken);
                            console.log(bestPool);

                            getActivePoolGroup()
                                .subscribe(activePoolGroupName => {

                                    // TODO CONTINUE HERE
                                    // To set best pool here if needed

                                    // const bestPool = Scoring.getBestPool(poolsData, ravenToken);
                                    // console.log(bestPool);
                                    // const activePoolChanged = !activePoolGroupName.includes(bestPool.id);
                                    console.log(activePoolGroupName);
                                    // console.log(activePoolChanged);

                                    // if (activePoolChanged) {

                                    //     setActivePool(bestPool);
                                    // }
                                    //         },
                                    //         error => {
                                    //             console.log(error);
                                });

                            if (bestPool !== activePool) {
                                setActivePool(bestPool);
                                activePool = bestPool;
                            }
                        },
                        error => {
                            console.log(error);
                        }
                    );
            }, bufferCrawlSec);
        });
}

function getActivePoolGroup(): Observable<string> {
    console.log('Getting Active Pool');
    return ChromeService.getTabByUrl(dashboardController.url)
        .pipe(
            mergeMap(
                (tab: Tab, index: number) => {
                    console.log('Tab found', tab);
                    console.log('dashboardControllerInjected:', dashboardControllerInjected);
                    if (!dashboardControllerInjected) {
                        console.log('injecting script');
                        return tab.injectScript(
                            'dashboard-controller.js',
                            { dashboardController, checkActive: true }
                        ).pipe(
                            mergeMap(
                                (value: Pool, index: number) => {
                                    dashboardControllerInjected = true;
                                    return tab.sendData({ dashboardController, checkActive: true });
                                }
                            )
                        );
                    } else {
                        console.log('sending data');

                        return tab.sendData({ dashboardController, checkActive: true });
                    }
                    // return tab.sendData({ dashboardController, checkActive: true });
                }
            )
        );
}

function setActivePool(pool: Pool): void {
    ChromeService.getTabByUrl(dashboardController.url)
        .subscribe((tab: Tab) => {
            if (!dashboardControllerInjected) {
                tab.injectScript(
                    'dashboard-controller.js',
                    { pool, dashboardController }
                ).subscribe(() => {
                    dashboardControllerInjected = true;
                    tab.sendData({ pool, dashboardController });
                });
            } else {
                tab.sendData({ pool, dashboardController });
            }
        });
}

function sanitizePools(pools: { [key: string]: Pool }): { [key: string]: Pool } {
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
                const multiplier = getTimeMultiplier(timePeriod);
                pools[key].blockTimePassedMin = timeNumber * multiplier;
            } else {
                pools[key].blockTimePassedMin = 0;
            }
        }
    }
    return pools;
}

function mergeDataByPool(poolsMixedData: Pool[]): { [key: string]: Pool } {
    const savedPools = {};
    for (const pool of poolsMixedData) {
        if (!savedPools[pool.id]) {
            savedPools[pool.id] = pool;
        } else {
            savedPools[pool.id] = { ...savedPools[pool.id], ...pool };
        }
    }

    return savedPools;
}

function getTimeMultiplier(timePeriod: string): number {
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