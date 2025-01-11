import express from "express";

import * as shopController from "../controller/shop.js";

const router = express.Router();

// URL: "/" => GET
router.get("/", shopController.getShopIndex);

// URL: "/products" => GET
router.get("/products", shopController.getProducts);

// URL: "/products/:productID" => GET
router.get("/products/:productID", shopController.getSingleProduct);

// URL: "/cart" => GET
router.get("/cart", shopController.getCart);

// URL: "/cart" => POST
router.post("/cart", shopController.postCart);

// URL: "/cart-delete-product" => POST
router.post("/cart-delete-product", shopController.postCartDeleteProduct);

// URL: "/orders" => GET
router.get("/orders", shopController.getOrders);

// URL: "/create-order" => POST
router.post("/create-order", shopController.postOrder);


// URL: "/checkout" => GET
// router.get("/checkout", shopController.getCheckout);

export default router;
