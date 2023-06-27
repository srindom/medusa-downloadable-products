import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export default function validateQuery(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

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

    req.query = result.data;
    next();
  };
}
