import Pool from "../../../models/Pool";
import Token from "../../../models/Token";

export default class Scoring {
    static getBestPool(pools: { [key: string]: Pool }, token: Token): Pool {
        let bestPool: Pool;
        for (const key in pools) {
            if (pools.hasOwnProperty(key)) {
                pools[key] = Scoring.calcPoolScore(pools[key], token);
                if (!bestPool || pools[key].score > bestPool.score) {
                    bestPool = pools[key];
                }
            }
        }

        return bestPool;
    }

    private static calcPoolScore(pool: Pool, token: Token): Pool {
        pool.averageBlockIntervalMin = Scoring.calcAverageBlockInterval(pool, token);
        pool.score = pool.averageBlockIntervalMin / pool.blockTimePassedMin;

        console.log(pool.id, pool.blockTimePassedMin, pool.averageBlockIntervalMin);
        console.log(pool.id, pool.score);
        return pool;
    }

    private static calcAverageBlockInterval(pool: Pool, token: Token): number {
        const result = (token.globalHashrateGh * token.averageBlockIntervalMin) / pool.speedGh;

        console.log(pool.id, 'Token global hashrate', token.globalHashrateGh);
        console.log(pool.id, 'Token Average Block Interval Min', token.averageBlockIntervalMin);
        console.log(pool.id, 'Pool speed GH', pool.speedGh);

        return result;
    }
}