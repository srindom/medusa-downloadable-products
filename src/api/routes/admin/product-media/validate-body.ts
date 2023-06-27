import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export default function validateBody(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (result.success === false) {
      res.status(400).json({
        error: {
          code: "invalid_request",
          message: "Invalid request",
          details: result.error,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
