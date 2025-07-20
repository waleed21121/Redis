import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = <T>(schema: ZodSchema<T>) => (req: Request, res: Response, next: NextFunction) => {
    const {error, data: result} = schema.safeParse(req.body);
    if(error) {
        res.status(400).json({
            success: false,
            errors: error.issues
        })
    }
    next();
}