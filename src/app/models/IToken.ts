import IPool from './IPool';

export default interface IToken {
    name: string;
    pools?: IPool[];
}
