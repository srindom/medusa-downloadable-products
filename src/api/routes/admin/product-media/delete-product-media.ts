import { Request, Response } from "express";
import ProductMediaService from "../../../../services/product-media";

export default async function (req: Request, res: Response) {
  const productMediaService: ProductMediaService = req.scope.resolve(
    "productMediaService",
  );
  const { id } = req.params;

  await productMediaService.delete(id);

  res.status(204).send();
}
