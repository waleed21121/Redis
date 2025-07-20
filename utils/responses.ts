import type { Response } from 'express';

export function successResponse (res: Response, data: any, message: string = 'success') {
    return res.status(200).send({
        success: true,
        message,
        data
    })
}

export function errorResponse (res: Response, status: number, error: string) {
    return res.status(status).send({
        success: false,
        error
    })
}