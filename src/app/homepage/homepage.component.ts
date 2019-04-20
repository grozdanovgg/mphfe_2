import { Component, OnInit } from '@angular/core';
import IPool from '../models/IPool';



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
      speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(3) > td:nth-child(7)',
      blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',
    },
    {
      name: 'yiimp',
      lastBlockUrl: 'http://yiimp.eu/site/block_results?id=2588',
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a',
      speedUrl: 'http://yiimp.eu/site/mining',
      speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(8) > td:nth-child(6)',
      blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',
    }
  ];

  constructor() { }

  ngOnInit() { }

  onStartClick() {

    chrome.runtime.sendMessage({ inject: this.pools });

    this.isHoppingActive = true;
  }

  onStopClick() {
    this.isHoppingActive = false;
  }

}
