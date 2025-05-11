import { Router } from "express";

import * as shopController from "../controller/shop.js";
import { isAuthenticated } from "../middleware/is-auth.js";

const router = Router();

// URL: "/" => GET
router.get("/", shopController.getShopIndex);

// URL: "/products" => GET
router.get("/products", shopController.getProducts);

// URL: "/products/:productID" => GET
router.get("/products/:productID", shopController.getSingleProduct);

// URL: "/cart" => GET
router.get("/cart", isAuthenticated, shopController.getCart);

// URL: "/cart" => POST
router.post("/cart", isAuthenticated, shopController.postCart);

// URL: "/cart-delete-product" => POST
router.post(
    "/cart-delete-product",
    isAuthenticated,
    shopController.postDeleteCartItem
);

// URL: "/orders" => GET
router.get("/orders", isAuthenticated, shopController.getOrders);

// URL: "/orders/:orderId" => GET
router.get("/orders/:orderId", isAuthenticated, shopController.getOrderInvoice);

// URL: "/create-order" => POST
router.post("/create-order", isAuthenticated, shopController.postOrder);

// URL: "/checkout" => GET
router.get("/checkout/:orderId", isAuthenticated, shopController.getCheckout);

export default router;
