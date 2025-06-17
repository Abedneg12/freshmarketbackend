import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validasi gagal',
        errors: result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
};
