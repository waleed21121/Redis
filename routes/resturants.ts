import { Router, Request } from 'express'
import { validate } from '../middlewares/validate';
import { Resturant, ResturantDetails, ResturantDetailsSchema, ResturantSchema } from '../schemas/resturant';
import redisClient from '../utils/client';
import { nanoid } from 'nanoid'
import { cuisineKey, cuisinesKey, indexKey, resturantCuisineKeyById, resturantDetailsKeyById, resturantKeyById, resturantsByRatingKey, reviewDetailsKeyById, reviewKeyById, weatherKeyById, bloomKey } from '../utils/keys';
import { errorResponse, successResponse } from '../utils/responses';
import { checkResturantExists } from '../middlewares/checkResturantId';
import { Review, ReviewSchema } from '../schemas/review';

const router = Router();

router.get('/', async (req, res, next) => {
        const { page = 1, limit = 10 } = req.query;
        const start = (Number(page) - 1) * Number(limit);
        const end = start + Number(limit) - 1;

        try {
            const resturantIds = await redisClient.zRange(resturantsByRatingKey, start, end, {REV: true});
            const resturants = await Promise.all(
                resturantIds.map((id) => {
                    return redisClient.hGetAll(resturantKeyById(id))
                })
            )
            return successResponse(res, resturants);
        } catch (error) {
            next(error)
        }
    })

router.post('/', validate(ResturantSchema), async (req, res, next) => {
    const data = req.body as Resturant;
    try {
        const id = nanoid();
        const resturantKey = resturantKeyById(id);
        const bloomString = `${data.name}:${data.location}`;
        const seenBefore = await redisClient.bf.exists(bloomKey, bloomString);
        if(seenBefore) {
            return errorResponse(res, 409, "Resturant already exists")
        }
        const hashData = {id, name: data.name, location: data.location};
        await Promise.all([
            redisClient.hSet(resturantKey, hashData),
            ...data.cuisines.map((cuisine) => Promise.all([
                redisClient.sAdd(cuisinesKey, cuisine),
                redisClient.sAdd(cuisineKey(cuisine), id),
                redisClient.sAdd(resturantCuisineKeyById(id), cuisine)
            ])),
            redisClient.zAdd(resturantsByRatingKey, {
                score: 0,
                value: id
            }),
            redisClient.bf.add(bloomKey, bloomString)
        ])
        return successResponse(res, hashData, "Added new resturant");
    } catch (error) {
        next(error)
    }
})

router.get('/search', async (req, res, next) => {
    const { q } = req.query;
    try {
        const results = await redisClient.ft.search(indexKey, `@name:${q}`);
        return successResponse(res, results)
    } catch (error) {
        
    }
})

router.post('/:resturantId/details',
    checkResturantExists,
    validate(ResturantDetailsSchema),
    async (req: Request<{resturantId: string}>, res, next) => {
        const { resturantId } = req.params;
        const data = req.body as ResturantDetails
        try {
            const resturantDetailsKey = resturantDetailsKeyById(resturantId);
            await redisClient.json.set(resturantDetailsKey, ".", data);
            return successResponse(res, {}, "Resturant details added");
        } catch (error) {
            next(error)
        }
    }
)

router.get('/:resturantId/details',
    checkResturantExists,
    async (req: Request<{resturantId: string}>, res, next) => {
        const { resturantId } = req.params;
        try {
            const resturantDetailsKey = resturantDetailsKeyById(resturantId);
            const details = await redisClient.json.get(resturantDetailsKey);
            return successResponse(res, details);
        } catch (error) {
            next(error)
        }
    }
)


router.get('/:resturantId/weather',
    checkResturantExists,
    async (req: Request<{resturantId: string}>, res, next) => {
        const { resturantId } = req.params;
        try {
            const resturantKey = resturantKeyById(resturantId);
            const weatherKey = weatherKeyById(resturantId);

            const cachedWeather = await redisClient.get(weatherKey);
            if(cachedWeather) {
                return successResponse(res, JSON.parse(cachedWeather));
            }

            const coords = await redisClient.hGet(resturantKey, 'location');
            if(!coords) {
                return errorResponse(res, 404, "Coordinates not found")
            }
            const [lng, lat] = coords.split(',');
            const apiResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lng}&appid=${process.env.WEATHER_API_KEY}`
            );

            if(apiResponse.status === 200) {
                const json = await apiResponse.json();
                const toBeCached = JSON.stringify(json);
                await redisClient.set(weatherKey, toBeCached, {
                    EX: 60 * 60
                });
                return successResponse(res, json);
            }
            
            return errorResponse(res, 500, 'Could not fetch weather info');
        } catch (error) {
            next(error)
        }
    }
)

router.get('/:resturantId',
    checkResturantExists,
    async (req: Request<{resturantId: string}>, res, next) => {
        const { resturantId } = req.params;
        try {
            const resturantKey = resturantKeyById(resturantId);
            const [resturant, viewCount, cuisines] = await Promise.all([
                redisClient.hGetAll(resturantKey),
                redisClient.hIncrBy(resturantKey, 'viewCount', 1),
                redisClient.sMembers(resturantCuisineKeyById(resturantId))
            ]);
            return successResponse(res, {...resturant, cuisines});
        } catch (error) {
            next(error)
        }
    })

router.post('/:resturantId/reviews',
    checkResturantExists,
    validate(ReviewSchema),
    async (req: Request<{resturantId: string}>, res, next) => {
        const { resturantId } = req.params;
        const data = req.body as Review;
        try {
            const reviewId = nanoid();
            const reviewKey = reviewKeyById(resturantId);
            const reviewDetailsKey = reviewDetailsKeyById(reviewId);
            const reviewData = { id: reviewId, ...data, timestamp: Date.now(), resturantId: resturantId };
            const [ reviewsCount, setResult, totalStars ] = await Promise.all([
                redisClient.lPush(reviewKey, reviewId),
                redisClient.hSet(reviewDetailsKey, reviewData),
                redisClient.hIncrByFloat(resturantKeyById(resturantId), "totalStars", data.rating)
            ]);
            const averageRating = Number((Number(totalStars) / reviewsCount).toFixed(1));
            await Promise.all([
                redisClient.zAdd(resturantsByRatingKey, {
                    score: averageRating,
                    value: resturantId
                }),
                redisClient.hSet(resturantKeyById(resturantId), 'avgStars', averageRating)
            ])
            return successResponse(res, reviewData, 'Review Added');
        } catch (error) {
            next(error)
        }
    }
)


router.get('/:resturantId/reviews',
    checkResturantExists,
    async (req: Request<{resturantId: string}>, res, next) => {
        const { resturantId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const start = (Number(page) - 1) * Number(limit);
        const end = start + Number(limit) - 1;

        try {
            const reviewKey = reviewKeyById(resturantId);
            const reviewIds = await redisClient.lRange(reviewKey, start, end);
            const reviews = await Promise.all(
                reviewIds.map( async (id) => {
                    return redisClient.HGETALL(reviewDetailsKeyById(id))
                })
            )
            return successResponse(res, reviews);
        } catch (error) {
            next(error)
        }
    }
)

router.delete('/:resturantId/reviews/:reviewId',
    checkResturantExists,
    async (req: Request<{resturantId: string, reviewId: string}>, res, next) => {
        const { resturantId, reviewId } = req.params;
        try {
            const reviewKey = reviewKeyById(resturantId);
            const reviewDetailsKey = reviewDetailsKeyById(reviewId);
            const [removeResult, deleteResult] = await Promise.all([
                redisClient.lRem(reviewKey, 0, reviewId),
                redisClient.del(reviewDetailsKey)
            ]);
            return successResponse(res, reviewId, 'Review deleted');
        } catch (error) {
            next(error)
        }
    }
)


export default router;