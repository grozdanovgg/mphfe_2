import IToken from './IToken';
import PoolConfig from './PoolConfig';

// TODO use the class pool, and methods inside it instead of the interface IPool

export default class Pool {
    config = new PoolConfig();

    constructor(
        name: string,
        lastBlockUrl: string,
        private propsToAssign?: PoolConfig
    ) {
        this.config.name = name;
        this.config.lastBlockUrl = lastBlockUrl;
        this.config = { ...this.config, ...propsToAssign };
    }

    public setAverageBlockInterval(token: IToken) {
        try {
            this.config.averageBlockIntervalMin = token.globalHashrateGh * token.averageBlockIntervalMin / this.config.poolSpeedGh;
        } catch (error) {
            return false;
        }
    }
}
