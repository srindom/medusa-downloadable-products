import { Router } from "express";

import listProductMedia from "./list-product-media";
import downloadFile from "./download-file";

const router = Router();

export default (adminRouter: Router) => {
  adminRouter.use("/product-media", router);

  router.get("/", listProductMedia);
  router.get("/:token", downloadFile);
};
