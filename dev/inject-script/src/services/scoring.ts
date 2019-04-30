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

        // for (const key in pools) {
        //     console.log(pools[key].id, pools[key].score);
        // }

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

        // TODO remove this workaround with the 0.
        // Implement solution to always get the right pool speed.
        if (pool.speedGh === 0) {
            pool.speedGh = 20
        }
        const result = (token.globalHashrateGh * token.averageBlockIntervalMin) / pool.speedGh;

        console.log(pool.id, 'Average Block Interval', token.globalHashrateGh, token.averageBlockIntervalMin, pool.speedGh);

        return result;
    }
}