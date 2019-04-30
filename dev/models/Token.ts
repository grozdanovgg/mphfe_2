import Pool from './Pool';
import BaseEntity from './BaseEntity';

export default class Token extends BaseEntity {
    name: string;
    identifiers?: string[]
    excludeIdentifiers?: string[];
    pools?: Pool[];
    averageBlockIntervalMin: number;
    globalHashrateGh: number;
}
