import { SCHEMA_FIELD_TYPE } from 'redis';
import redisClient from '../utils/client';
import { indexKey, getKeyName } from '../utils/keys';

async function createIndex() {
    await redisClient.connect();
    try {
        await redisClient.ft.dropIndex(indexKey);
    } catch (error) {
        console.log('No existing index to delete');
    }

    await redisClient.ft.create(indexKey, {
        id: {
            type: SCHEMA_FIELD_TYPE.TEXT,
            AS: 'id'
        }, 
        name: {
            type: SCHEMA_FIELD_TYPE.TEXT,
            AS: 'name'
        },
        avgStars: {
            type: SCHEMA_FIELD_TYPE.NUMERIC,
            AS: 'avgStars',
            SORTABLE: true
        }
    }, {
        ON: "HASH",
        PREFIX: getKeyName("resturants")
    })
}

createIndex().then(() => {
    console.log('script ran succefully');
});
//process.exit();