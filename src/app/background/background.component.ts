import { Component, OnInit } from '@angular/core';
import ITab from '../models/ITab';
import { Observable, forkJoin, Subscription } from 'rxjs';
import IPool from '../models/IPool';
import { map } from 'rxjs/operators';
import IToken from '../models/IToken';


const ravenToken = {
  name: 'RavenCoin',
  averageBlockIntervalMin: 1,
  globalHashrateGh: 3260
};

@Component({
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {

  activePool: IPool;
  reloadIntevalSec = 20 * 1000;
  bufferCrawlSec = 10 * 1000;
  constructor() { }

  ngOnInit() {

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

      if (message.inject) {
        this.tickInjectScript(message.inject);
        setInterval(() => {

          this.tickInjectScript(message.inject);
        }, this.reloadIntevalSec);
      }
    });
  }

  private tickInjectScript(pools: IPool[]) {
    chrome.tabs.query({ currentWindow: true }, (tabs: ITab[]) => {

      const crawlingPools: Observable<IPool>[] = [];
      const poolTabs: ITab[] = [];

      for (const pool of pools) {
        const tabFound: ITab = tabs.find(tab => {

          return tab.url === pool.lastBlockUrl;
        });
        const poolTabFound: ITab = tabs.find(tab => {

          return tab.url === pool.speedUrl;
        });

        poolTabs.push(tabFound);
        poolTabs.push(poolTabFound);

        chrome.tabs.reload(tabFound.id, null, () => {
          const blockCrawlerSubscr: Observable<IPool> = this.injectBlockCrawler(pool, tabFound.id);
          crawlingPools.push(blockCrawlerSubscr);
        });
        chrome.tabs.reload(poolTabFound.id, null, () => {
          const poolCrawlerSubscr: Observable<IPool> = this.injectPoolCrawler(pool, poolTabFound.id);
          crawlingPools.push(poolCrawlerSubscr);
        });
      }

      setTimeout(() => {
        forkJoin(crawlingPools)
          .pipe(map((poolsData: IPool[]) => {

            return this.mergeDataByPool(poolsData);
          }))
          .subscribe((poolsData: { [key: string]: IPool }) => {

            poolsData = this.sanitizePools(poolsData);

            // Best pool found
            const bestPool = this.getBestPool(poolsData, ravenToken);
            if (bestPool !== this.activePool) {
              this.setActivePool(bestPool);
            }
          });
      }, this.bufferCrawlSec);

    });
  }

  private setActivePool(pool: IPool): void {

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

    return bestPool;
  }

  private sanitizePools(pools: { [key: string]: IPool }) {
    for (const key in pools) {
      if (pools.hasOwnProperty(key)) {
        const stringDigits = pools[key].speedTextGh.split(' ')[0];
        pools[key].speedGh = +stringDigits;

        if (pools[key].blockTimePassedText) {
          const timeNumber = +pools[key].blockTimePassedText.match(/\d+/)[0];
          const timePeriod = pools[key].blockTimePassedText[pools[key].blockTimePassedText.length - 1];
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

  private calcPoolScore(pool: IPool, token: IToken): IPool {

    pool.averageBlockIntervalMin = this.calcAverageBlockInterval(pool, token);
    pool.score = pool.blockTimePassedMin / pool.averageBlockIntervalMin;

    return pool;
  }

  private calcAverageBlockInterval(pool: IPool, token: IToken): number {

    const result = (token.globalHashrateGh * token.averageBlockIntervalMin) / pool.speedGh;

    return result;
  }

  private injectBlockCrawler(pool: IPool, tabId): Observable<IPool> {

    return Observable.create(observer => {
      chrome.tabs.executeScript(
        tabId,
        {
          file: 'assets/block-crawler.js'
        },
        result => {
          chrome.tabs.sendMessage(tabId, { pool }, response => {
            observer.next(response);
            observer.complete();
          });
        });
    });
  }

  private injectPoolCrawler(pool: IPool, tabId): Observable<IPool> {

    return Observable.create(observer => {
      chrome.tabs.executeScript(
        tabId,
        {
          file: 'assets/pool-info-crawler.js'
        },
        result => {
          chrome.tabs.sendMessage(tabId, { pool }, response => {
            observer.next(response);
            observer.complete();
          });
        });
    });
  }

}
