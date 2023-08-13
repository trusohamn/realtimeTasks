export function logRequest(req: Request, res: Response, next: NextFunction) {
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development') console.log(req.method + ' ' + req.url + ' ' + JSON.stringify(req.body))
    next();
}