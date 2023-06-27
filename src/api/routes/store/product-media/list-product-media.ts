import { wrapHandler } from "@medusajs/utils";
import validateQuery from "./validate-query";
import { Request, Response } from "express";
import { z } from "zod";
import ProductMediaService from "../../../../services/product-media";
import {
  ProductMediaVariantDTO,
  ResponseProductMedia,
  FilterableProductMediaFields,
} from "../../../../types/product-media";
import { ProductMediaVariantType } from "../../../../models/product-media-variant";

const requestSchema = z.object({
  variant_id: z.string().or(z.array(z.string())).optional(),
  limit: z.coerce.number().int().positive().optional().default(10),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  expand: z.array(z.enum(["variants"])).optional(),
});

export type ProductMediaListParams = z.infer<typeof requestSchema>;

async function handler(req: Request, res: Response) {
  const productMediaService: ProductMediaService = req.scope.resolve(
    "productMediaService"
  );
  const { limit, offset, expand, ...query } =
    req.query as ProductMediaListParams;

  const selector: FilterableProductMediaFields = {
    ...query,
    attachment_type: ProductMediaVariantType.PREVIEW,
  };

  const [productMedia, count] = await productMediaService.listAndCount(
    selector,
    {
      take: limit,
      skip: offset,
    }
  );

  const result: ResponseProductMedia[] = productMedia;

  if (expand?.includes("variants")) {
    const mediaIds = productMedia.map((m) => m.id);
    const variants = await productMediaService.listVariants(mediaIds);

    // create variant map for faster lookup Map<mediaId, variants[]>
    const variantMap = new Map<string, ProductMediaVariantDTO[]>();

    variants.forEach((v) => {
      if (!variantMap.has(v.product_media_id)) {
        variantMap.set(v.product_media_id, []);
      }

      variantMap.get(v.product_media_id).push(v);
    });

    result.forEach((m) => {
      m.variants = variantMap.get(m.id) || [];
    });
  }

  res.json({
    product_medias: result,
    count,
    limit,
    offset,
  });
}

export default [validateQuery(requestSchema), wrapHandler(handler)];
