import { Request, Response, NextFunction} from 'express';
import redisClient from '../utils/client';
import { resturantKeyById } from '../utils/keys';
import { errorResponse } from '../utils/responses';

export const checkResturantExists = async (req: Request<{resturantId: string}>, res: Response, next: NextFunction) => {
    const { resturantId } = req.params;
    if(!resturantId) {
        return errorResponse(res, 400, 'Resturant id not found');
    }
    const resturantKey = resturantKeyById(resturantId);
    const exists = await redisClient.exists(resturantKey);
    if(!exists) {
        return errorResponse(res, 404, 'Resturant not found');
    }
    next();
}