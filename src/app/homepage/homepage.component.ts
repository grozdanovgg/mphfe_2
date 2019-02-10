import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
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
      name: 'ravenPool',
      lastBlockUrl: 'https://eu.ravenminer.com/site/block?id=1425',
      // lastBlockNumber: null,
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a',
      poolSpeedUrl: 'https://eu.ravenminer.com/',
      poolSpeedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr > td:nth-child(5)'
    },
    {
      name: 'ravenPool',
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

  onStart() {
    this.isHoppingActive = true;

    chrome.tabs.query({ currentWindow: true }, (tabs: ITab[]) => {

      const crawlingPools: Observable<void>[] = [];

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
        .subscribe((poolsData) => {

          // TODO 
          // HERE we get the POOLS data.
          // Should continue working from this point on
          console.log(poolsData);
        });
    });
  }

  onStop() {
    this.isHoppingActive = false;
  }

  private injectBlockCrawler(pool: IPool, tabId) {

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

  private injectPoolCrawler(pool: IPool, tabId) {

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
