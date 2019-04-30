import IWebPage from './IWebPage';
import BaseEntity from './BaseEntity';
import IConstructOptions from './IConstructOptions';

export default class Dashboard extends BaseEntity {
    url: string;
    checkboxAllRigsSelector?: string;
    assignGroupBtnHtmlId?: string;
}
