export default interface IPool {
    name?: string;
    lastBlockUrl?: string;
    poolSpeedUrl?: string;
    // tabAddress?: string;
    // lastBlockNumber?: number;
    lastBlockHTMLSelector?: string;
    poolSpeedHTMLSelector?: string;
    blockTimeHtmlSelector?: string;
    // forToken?: string;
    // active?: boolean;
    poolSpeedGh?: number;
    blockNumber?: string;
    blockTimePassedMin?: number;
    averageBlockIntervalMin?: number;
    score?: number;
}
