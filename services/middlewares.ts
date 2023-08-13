import { Request, Response, NextFunction } from 'express';

export function extractUserId(req: Request, res: Response, next: NextFunction) {
    const userId = req.header('user-id');
    if (!userId) {
        res.status(400).json({ error: 'Missing user ID in headers' });
        return;
    }

    req.userId = userId;
    next();
}

export function logRequest(req: Request, res: Response, next: NextFunction) {
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development') console.log(req.method + ' ' + req.url + ' ' + JSON.stringify(req.body) + ' ' + req.headers['userid'] + ' ' + JSON.stringify(req.query))
    next();
}