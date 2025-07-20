import redisClient from "../utils/client";
import { bloomKey } from "../utils/keys";

async function createBloomFilters () {
    await redisClient.connect();
    await Promise.all([
        redisClient.del(bloomKey),
        redisClient.bf.reserve(bloomKey, 0.0001, 1000000)
    ])
}

createBloomFilters().then(() => {
    console.log('script ra successfully');
});