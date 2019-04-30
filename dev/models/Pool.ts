import BaseEntity from './BaseEntity';
import IConstructOptions from './IConstructOptions';

export default class Pool extends BaseEntity {
    id?: string;
    lastBlockUrl?: string;
    speedUrl?: string;
    lastBlockHTMLSelector?: string;
    speedContainerHtmlSelector?: string;
    speedColNameIndex?: number;
    speedColSpeedIndex?: number;
    speedHTMLSelector?: string;
    blockTimeHtmlSelector?: string;
    speedGh?: number;
    speedTextGh?: string;
    blockNumber?: string;
    blockTimePassedMin?: number;
    blockTimePassedText?: string;
    averageBlockIntervalMin?: number;
    score = 0;

    constructor(options: IConstructOptions) {
        super(options);
    }
}