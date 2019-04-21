import IPool from './IPool';

export default interface IToken {
    name: string;
    identifiers?: string[]
    pools?: IPool[];
    averageBlockIntervalMin: number;
    globalHashrateGh: number;
}
