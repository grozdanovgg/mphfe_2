import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  isHoppingActive = false;

  constructor() { }

  ngOnInit() {
  }

  onStart() {
    this.isHoppingActive = true;

    chrome.tabs.query({ currentWindow: true }, (tabs: ITab[]) => {

      const crawlingPools: Observable<void>[] = [];

      for (const pool of pools) {
        const tabFound = tabs.find(tab => {
          return tab.url === pool.url;
        });
        crawlingPools.push(this.crawlPool(pool, tabFound.id));
      }

      forkJoin(crawlingPools)
        .subscribe((allPools) => {
          observer.next(allPools);
        });
    });
  }

  onStop() {
    this.isHoppingActive = false;
  }

}
