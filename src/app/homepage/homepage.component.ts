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
    // {
    //   name: 'cryptopool',
    //   lastBlockUrl: 'https://cryptopool.party/site/block_results?id=2013',
    //   lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4)',
    //   blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',
    //   speedUrl: 'https://cryptopool.party/',
    //   speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(3) > td:nth-child(7)'
    // },
    {
      name: 'cryptopool',
      lastBlockUrl: 'https://cryptopool.party/site/block_results?id=2013',
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4)',
      blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',

      speedContainerHtmlSelector: '#maintable1',
      speedColNameIndex: 1,
      speedColSpeedIndex: 5,
      speedUrl: 'https://cryptopool.party/site/current_results',
      speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(4) > td:nth-child(7)'
    },
    {
      name: 'yiimp',
      lastBlockUrl: 'http://yiimp.eu/site/block_results?id=2588',
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a',
      blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',

      speedContainerHtmlSelector: '#maintable1',
      speedColNameIndex: 0,
      speedColSpeedIndex: 5,
      speedUrl: 'http://yiimp.eu/site/mining',
      speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(8) > td:nth-child(6)'
    },
    // {
    //   name: 'bsod',
    //   lastBlockUrl: 'https://bsod.pw/site/block?id=2176',
    //   lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a',
    //   blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',
    //   speedUrl: 'https://bsod.pw/site/mining',
    //   speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr.ssrow.ssrow-x16r > td:nth-child(6)'
    // },
    {
      name: 'pickaxe',
      lastBlockUrl: 'https://www.pickaxe.pro/site/block_results?id=3142',
      lastBlockHTMLSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(4) > a',
      blockTimeHtmlSelector: '#maintable > tbody > tr:nth-child(1) > td:nth-child(3) > b > span',

      speedContainerHtmlSelector: '#maintable1',
      speedColNameIndex: 0,
      speedColSpeedIndex: 5,
      speedUrl: 'https://www.pickaxe.pro/site/current_results',
      speedHTMLSelector: '#maintable1 > tbody:nth-child(2) > tr:nth-child(6) > td:nth-child(6)'
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
