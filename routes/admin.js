import { Router } from "express";

import * as adminController from "../controller/admin.js";

const router = Router();

// URL: "/admin/add-product" => GET
router.get("/add-product", adminController.getAddProduct);

// URL: "/admin/add-product" => POST
router.post("/add-product", adminController.postAddProduct);

// URL: "/admin/edit-product" => GET
router.get("/edit-product/:productID", adminController.getEditProduct);

// URL: "/admin/edit-product" => POST
router.post("/edit-product", adminController.postEditProduct);

// URL: "/admin/delete-product" => POST
router.post("/delete-product", adminController.postDeleteProduct);

// URL: "/admin/products" => GET
router.get("/products", adminController.getAdminProducts);

export default router;
