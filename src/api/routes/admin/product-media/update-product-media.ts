import { wrapHandler } from "@medusajs/utils";
import validateBody from "./validate-body";
import { Request, Response } from "express";
import { z } from "zod";
import ProductMediaService from "../../../../services/product-media";

async function handler(req: Request, res: Response) {
  const productMediaService: ProductMediaService = req.scope.resolve(
    "productMediaService"
  );
  const { id } = req.params;

  const productMedia = await productMediaService.update(id, req.body);

  res.json({
    product_media: productMedia,
  });
}

const requestSchema = z.object({
  name: z.string().optional(),
  file: z.string().optional(),
  mime_type: z.string().optional(),
});

export type AdminPostProductMediaProductMediaReq = z.infer<
  typeof requestSchema
>;

export default [validateBody(requestSchema), wrapHandler(handler)];
