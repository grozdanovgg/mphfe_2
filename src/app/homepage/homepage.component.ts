import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import IPool from '../models/IPool';
import ITab from '../models/ITab';

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
      // lastBlockNumber: null,
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4)',
      poolSpeedUrl: 'https://cryptopool.party/',
      poolSpeedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(5) > td:nth-child(7)'
    },
    {
      name: 'yiimp',
      lastBlockUrl: 'http://yiimp.eu/site/block_results?id=2588',
      // lastBlockNumber: null,
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a',
      poolSpeedUrl: 'http://yiimp.eu/site/mining',
      poolSpeedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(10) > td:nth-child(6)'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

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
          const bestPool = this.getBestPool();

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
            // console.log(response.poolSpeed);
            observer.next(response);
            observer.complete();
          });
        });
    });
  }

}
