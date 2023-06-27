import { wrapHandler } from "@medusajs/utils";
import { Router } from "express";

import getProductMedia from "./get-product-media";
import listProductMedia from "./list-product-media";
import createProductMedia from "./create-product-media";
import updateProductMedia from "./update-product-media";
import deleteProductMedia from "./delete-product-media";
import attachProductMediaToVariant from "./attach-product-media-to-variant";
import detachProductMediaFromVariant from "./detach-product-media-from-variant";

const router = Router();

export default (adminRouter: Router) => {
  adminRouter.use("/product-media", router);

  router.get("/", listProductMedia);
  router.get("/:media_id", wrapHandler(getProductMedia));
  router.post("/", createProductMedia);
  router.post("/:media_id", updateProductMedia);
  router.delete("/:media_id", wrapHandler(deleteProductMedia));

  router.post("/:media_id/variant", attachProductMediaToVariant);
  router.delete(
    "/:media_id/variant/:variant_id",
    detachProductMediaFromVariant
  );
};
