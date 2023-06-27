import { wrapHandler } from "@medusajs/utils";
import validateBody from "./validate-body";
import { Request, Response } from "express";
import { z } from "zod";
import ProductMediaService from "../../../../services/product-media";
import { EntityManager } from "typeorm";

async function handler(req: Request, res: Response) {
  const manager: EntityManager = req.scope.resolve("manager");
  const productMediaService: ProductMediaService = req.scope.resolve(
    "productMediaService"
  );

  const productMedia = await manager.transaction(async (transactionManager) => {
    const productMedia = await productMediaService.create(req.body, {
      transactionManager,
    });

    if (req.body.product_variant) {
      await productMediaService.attachToVariant(
        productMedia.id,
        req.body.product_variant.id,
        req.body.product_variant.type,
        {
          transactionManager,
        }
      );
    }

    return productMedia;
  });

  res.json({
    product_media: productMedia,
  });
}

const requestSchema = z.object({
  name: z.string(),
  file: z.string(),
  mime_type: z.string(),
  product_variant: z
    .object({
      id: z.string(),
      type: z.enum(["preview", "main"]),
    })
    .optional(),
});

export type AdminPostProductMediaReq = z.infer<typeof requestSchema>;

export default [validateBody(requestSchema), wrapHandler(handler)];
