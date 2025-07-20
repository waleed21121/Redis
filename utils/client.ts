import { createClient, type RedisClientType } from 'redis';

let redisClient: RedisClientType = createClient();

export default redisClient;



