import { Request, Response, NextFunction } from 'express';

export const errorHandlers = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
};
