export default interface IPool {
    name: string;
    // tabAddress?: string;
    lastBlockUrl: string;
    // lastBlockNumber?: number;
    lastBlockHTMLSelector?: string;
    poolSpeedUrl?: string;
    poolSpeedHTMLSelector?: string;
    // forToken?: string;
    // active?: boolean;
    poolSpeed?: number;
    blockNumber?: string;
    blockTimePassedMin: number;
    averageBlockInterval?: number;
    score?: number;
}
