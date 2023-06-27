import { Request, Response } from "express";
import ProductMediaService from "../../../../services/product-media";

export default async function (req: Request, res: Response) {
  const productMediaService: ProductMediaService = req.scope.resolve(
    "productMediaService"
  );
  const { media_id: id } = req.params;

  const productMedia = await productMediaService.retrieve(id);
  const variants = await productMediaService.listVariants([id]);

  const result = {
    ...productMedia,
    variants,
  };

  res.json({
    product_media: result,
  });
}
