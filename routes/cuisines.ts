import { Router, Request } from 'express'
import redisClient from '../utils/client';
import { cuisineKey, cuisinesKey, resturantKeyById } from '../utils/keys';
import { successResponse } from '../utils/responses';

const router = Router();

router.get('/', async(req, resizeBy, next) => {
    try {
        const cuisines = await redisClient.sMembers(cuisinesKey);
        return successResponse(resizeBy, cuisines);
    } catch (error) {
        next(error)
    }
})

router.get('/:cuisine', async(req: Request<{cuisine: string}>, res, next) => {
    const { cuisine } = req.params;
    try {
        const resturantIds = await redisClient.sMembers(cuisineKey(cuisine));
        const resturants = await Promise.all([
            ...resturantIds.map((id) => {
                return redisClient.hGet(resturantKeyById(id), 'name')
            })
        ])
        return successResponse(res, resturants)
    } catch (error) {
        next(error)
    }
})

export default router;