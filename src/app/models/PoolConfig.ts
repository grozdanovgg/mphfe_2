export default class PoolConfig {
    name: string;
    lastBlockUrl: string;
    lastBlockHTMLSelector: string;
    poolSpeedHTMLSelector: string;
    blockTimeHtmlSelector: string;
    blockTimePassedMin: number;
    poolSpeedUrl: string;
    poolSpeedGh: number;
    blockNumber: string;
    averageBlockIntervalMin: number;
    score = 0;
}
