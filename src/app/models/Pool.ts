import IToken from './IToken';

// TODO use the class pool, and methods inside it instead of the interface IPool

export default class Pool {
    lastBlockHTMLSelector: string;
    poolSpeedUrl: string;
    poolSpeedHTMLSelector: string;
    poolSpeedGh: number;
    blockNumber: string;
    averageBlockIntervalMin: number;
    score: number;

    constructor(
        readonly name: string,
        public lastBlockUrl: string,
    ) { }


    setAverageBlockInterval(token: IToken) {
        try {
            this.averageBlockIntervalMin = token.globalHashrateGh * token.averageBlockIntervalMin / this.poolSpeedGh;
        } catch (error) {
            return false;
        }
    }
}
