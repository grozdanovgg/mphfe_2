import IPool from './IPool';

export default interface IToken {
    name: string;
    identifiers?: string[]
    excludeIdentifiers?: string[];
    pools?: IPool[];
    averageBlockIntervalMin: number;
    globalHashrateGh: number;
}
