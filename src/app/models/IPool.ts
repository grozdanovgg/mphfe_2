export default interface IPool {
    name?: string;
    lastBlockUrl?: string;
    speedUrl?: string;
    // tabAddress?: string;
    // lastBlockNumber?: number;
    lastBlockHTMLSelector?: string;
    speedContainerHtmlSelector?: string,
    speedColNameIndex?: number,
    speedColSpeedIndex?: number,
    speedHTMLSelector?: string;
    blockTimeHtmlSelector?: string;
    // forToken?: string;
    // active?: boolean;
    speedGh?: number;
    speedTextGh?: string;
    blockNumber?: string;
    blockTimePassedMin?: number;
    blockTimePassedText?: string;
    averageBlockIntervalMin?: number;
    score?: number;
}
