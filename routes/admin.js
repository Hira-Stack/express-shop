import { Router } from "express";

import * as adminController from "../controller/admin.js";
import { isAuthenticated } from "../middleware/is-auth.js";
import * as validate from "../middleware/validate.js";

const router = Router();

// URL: "/admin/add-product" => GET
router.get("/add-product", isAuthenticated, adminController.getAddProduct);

// URL: "/admin/add-product" => POST
router.post(
    "/add-product",
    isAuthenticated,
    validate.productTitleValidator(),
    validate.productImageUrlValidator(),
    validate.productPriceValidator(),
    validate.productDescriptionValidator(),
    adminController.postAddProduct
);

// URL: "/admin/edit-product" => GET
router.get(
    "/edit-product/:productID",
    isAuthenticated,
    adminController.getEditProduct
);

// URL: "/admin/edit-product" => POST
router.post(
    "/edit-product",
    isAuthenticated,
    validate.productTitleValidator(),
    validate.productImageUrlValidator(),
    validate.productPriceValidator(),
    validate.productDescriptionValidator(),
    adminController.postEditProduct
);

// URL: "/admin/product/:productID" => DELETE
router.delete(
    "/product/:productID",
    isAuthenticated,
    adminController.deleteProduct
);

// URL: "/admin/products" => GET
router.get("/products", isAuthenticated, adminController.getAdminProducts);

export default router;
