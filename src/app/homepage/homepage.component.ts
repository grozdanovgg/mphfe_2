import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import ITab from '../models/ITab';
import IToken from '../models/IToken';
import IPool from '../models/IPool';

const ravenToken = {
  name: 'RavenCoin',
  averageBlockIntervalMin: 1,
  globalHashrateGh: 3260
};


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  isHoppingActive = false;
  // TODO input pools,
  // hard code them temporaly

  // Currently you have to open all the pages manually for the app to work
  pools: IPool[] = [
    {
      name: 'cryptopool',
      lastBlockUrl: 'https://cryptopool.party/site/block_results?id=2013',
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4)',
      speedUrl: 'https://cryptopool.party/',
      speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(5) > td:nth-child(7)',
      blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',
    },
    {
      name: 'yiimp',
      lastBlockUrl: 'http://yiimp.eu/site/block_results?id=2588',
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a',
      speedUrl: 'http://yiimp.eu/site/mining',
      speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(10) > td:nth-child(6)',
      blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',
    }
  ];

  constructor() { }

  ngOnInit() { }

  onStartClick() {
    this.isHoppingActive = true;

    chrome.tabs.query({ currentWindow: true }, (tabs: ITab[]) => {

      const crawlingPools: Observable<IPool>[] = [];

      for (const pool of this.pools) {
        const tabFound = tabs.find(tab => {
          return tab.url === pool.lastBlockUrl;
        });
        const blockCrawlerSubscr = this.injectBlockCrawler(pool, tabFound.id);
        crawlingPools.push(blockCrawlerSubscr);
      }

      for (const pool of this.pools) {
        const poolTabFound = tabs.find(tab => {
          return tab.url === pool.speedUrl;
        });
        const poolCrawlerSubscr = this.injectPoolCrawler(pool, poolTabFound.id);
        crawlingPools.push(poolCrawlerSubscr);
      }

      forkJoin(crawlingPools)
        .pipe(
          map(poolsData => {
            return this.mergeDataByPool(poolsData);
          })
        )
        .subscribe((poolsData) => {

          // TODO
          // HERE we get the POOLS data.
          // Should continue working from this point on
          poolsData = this.sanitizePools(poolsData);

          const bestPool = this.getBestPool(poolsData, ravenToken);
          console.log(bestPool);
          // TODO BEST POOL FOUND>
          // CONTINUE HERE

          // TODO this logic
          // this is only in idea example
          // if(bestPool !== currentPool){
          //   this.setActivePool(bestPool);
          // }
        });
    });
  }

  onStopClick() {
    this.isHoppingActive = false;
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
        const poolScore = this.calcPoolScore(pools[key], token);
        if (poolScore > bestPool.score) {
          bestPool = pools[key];
        }
      }
    }

    return bestPool;
  }

  private calcPoolScore(pool: IPool, token: IToken): number {

    pool.averageBlockIntervalMin = this.calcAverageBlockInterval(pool, token);
    const result = pool.blockTimePassedMin / pool.averageBlockIntervalMin;
    // console.log(pool.blockTimePassedMin, pool.averageBlockIntervalMin);
    return result;
  }

  private calcAverageBlockInterval(pool: IPool, token: IToken): number {

    const result = (token.globalHashrateGh * token.averageBlockIntervalMin) / pool.speedGh;
    return result;
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

  private injectBlockCrawler(pool: IPool, tabId): Observable<IPool> {
    return Observable.create(observer => {
      chrome.tabs.executeScript(
        tabId,
        {
          file: 'assets/block-crawler.js'
        },
        result => {
          chrome.tabs.sendMessage(tabId, pool, response => {
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
          chrome.tabs.sendMessage(tabId, pool, response => {
            observer.next(response);
            observer.complete();
          });
        });
    });
  }

}
