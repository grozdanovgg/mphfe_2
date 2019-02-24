import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import Pool from '../models/Pool';
import ITab from '../models/ITab';
import IToken from '../models/IToken';
import PoolConfig from '../models/PoolConfig';

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
  pools: PoolConfig[] = [];

  constructor() { }

  ngOnInit() {
    const poolA = new PoolConfig();
    poolA.name = 'cryptopool';
    poolA.lastBlockUrl = 'https://cryptopool.party/site/block_results?id=2013';
    poolA.lastBlockHTMLSelector = '#maintable > tbody > tr:nth-child(1) > td:nth-child(4)';
    poolA.poolSpeedUrl = 'https://cryptopool.party/';
    poolA.poolSpeedHTMLSelector = '#maintable1 > tbody:nth-child(2) > tr:nth-child(5) > td:nth-child(7)';
    poolA.blockTimeHtmlSelector = '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span';

    const poolB = new PoolConfig();
    poolB.name = 'yiimp';
    poolB.lastBlockUrl = 'http://yiimp.eu/site/block_results?id=2588';
    poolB.lastBlockHTMLSelector = '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a';
    poolB.poolSpeedUrl = 'http://yiimp.eu/site/mining';
    poolB.poolSpeedHTMLSelector = '#maintable1 > tbody:nth-child(2) > tr:nth-child(10) > td:nth-child(6)';
    poolB.blockTimeHtmlSelector = '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span';

    this.pools.push(poolA);
    this.pools.push(poolB);
  }

  onStartClick() {
    this.isHoppingActive = true;

    chrome.tabs.query({ currentWindow: true }, (tabs: ITab[]) => {

      const crawlingPools: Observable<PoolConfig>[] = [];

      for (const pool of this.pools) {
        const tabFound = tabs.find(tab => {
          return tab.url === pool.lastBlockUrl;
        });
        const blockCrawlerSubscr = this.injectBlockCrawler(pool, tabFound.id);
        crawlingPools.push(blockCrawlerSubscr);
      }

      for (const pool of this.pools) {
        const poolTabFound = tabs.find(tab => {
          return tab.url === pool.poolSpeedUrl;
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
          console.log(poolsData);
          const bestPool = this.getBestPool(poolsData);

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

  private getBestPool(pools: { [key: string]: Pool }): Pool {
    let bestPool = new Pool('', '');
    for (const key in pools) {
      if (pools.hasOwnProperty(key)) {
        const poolScore = this.calcPoolScore(pools[key], ravenToken);
        if (poolScore > bestPool.config.score) {
          bestPool = pools[key];
        }
      }
    }

    return bestPool;
  }

  private calcPoolScore(pool: Pool, token: IToken): number {

    pool.setAverageBlockInterval(token);

    // pool.averageBlockIntervalMin
    // let score: number;
    return 1;


  }

  private mergeDataByPool(poolsMixedData: PoolConfig[]): { [key: string]: Pool } {
    const savedPools = {};
    for (const pool of poolsMixedData) {
      if (!savedPools[pool.name]) {
        savedPools[pool.name] = pool;
      } else {

        savedPools[pool.name] = new Pool(pool.name, pool.lastBlockUrl, pool);
      }

    }

    return savedPools;
  }

  private injectBlockCrawler(pool: PoolConfig, tabId): Observable<PoolConfig> {
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

  private injectPoolCrawler(pool: PoolConfig, tabId): Observable<PoolConfig> {

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
