import Pool from './Pool';

export default interface IToken {
    name: string;
    pools?: Pool[];
    averageBlockIntervalMin: number;
    globalHashrateGh: number;
}
