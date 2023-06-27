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
  const { variant_id, type } = req.body;

  const productMedia = await productMediaService.attachToVariant(
    id,
    variant_id,
    type
  );

  res.json({
    product_media: productMedia,
  });
}

const requestSchema = z.object({
  variant_id: z.string(),
  type: z.enum(["preview", "main"]),
});

export type AdminPostProductMediaProductMediaVariantsReq = z.infer<
  typeof requestSchema
>;

export default [validateBody(requestSchema), wrapHandler(handler)];
