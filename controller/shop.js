import path from "path";
import fs from "fs";

import pdfDocumnet from "pdfkit";

import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import { rootDir } from "../util/paths.js";

// Maximum number of item that should be shown on each page
const MAX_ITEMS_PER_PAGE = 3;

// Access to "shop" page using "GET" method
export const getShopIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalProductItems = 0;

    Product.find()
        .countDocuments()
        .then((numberOfProducts) => {
            totalProductItems = numberOfProducts;

            return Product.find()
                .skip((page - 1) * MAX_ITEMS_PER_PAGE)
                .limit(MAX_ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render("./shop/index", {
                products: products,
                pageTitle: "Shop",
                path: "/",
                totalProducts: totalProductItems,
                hasPreviousPage: page > 1,
                hasNextPage: MAX_ITEMS_PER_PAGE * page < totalProductItems,
                previousPage: page - 1,
                currentPage: page,
                nextPage: page + 1,
                lastPage: Math.ceil(totalProductItems / MAX_ITEMS_PER_PAGE)
            });
        })
        .catch((err) => next(new Error(err)));
};

// Access to "products" page using "GET" method
export const getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalProductItems = 0;

    Product.find()
        .countDocuments()
        .then((numberOfProducts) => {
            totalProductItems = numberOfProducts;

            return Product.find()
                .skip((page - 1) * MAX_ITEMS_PER_PAGE)
                .limit(MAX_ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render("./shop/product-list", {
                products: products,
                pageTitle: "All Products",
                path: "/products",
                totalProducts: totalProductItems,
                hasPreviousPage: page > 1,
                hasNextPage: MAX_ITEMS_PER_PAGE * page < totalProductItems,
                previousPage: page - 1,
                currentPage: page,
                nextPage: page + 1,
                lastPage: Math.ceil(totalProductItems / MAX_ITEMS_PER_PAGE)
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "products/:productID" page using "GET" method (By unique product ID)
export const getSingleProduct = (req, res, next) => {
    const productID = req.params.productID;

    Product.findById(productID)
        .then((product) => {
            res.render("./shop/product-detail", {
                product: product,
                pageTitle:
                    product !== null ? product.title : "Product Not Found",
                path: "/products"
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "cart" page using "GET" method
export const getCart = (req, res, next) => {
    req.user
        .populate("cart.items.product")
        .then((user) => {
            res.render("./shop/cart", {
                pageTitle: "Your Cart",
                path: "/cart",
                products: user.cart.items,
                totalPrice: user.cart.totalPrice
            });
        })
        .catch((err) => {
            // What is status code?
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

// Access to "cart" page using "POST" method
export const postCart = (req, res, next) => {
    const userID = req.user._id;
    const productID = req.body.productID;

    User.findById(userID)
        .then((user) => {
            return user.addToCart(productID).populate("cart.items.product");
        })
        .then((updatedUser) => {
            const cartItems = updatedUser.cart.items;
            let totalPrice = 0;
            // Update total price of user's cart
            cartItems.forEach((item) => {
                totalPrice += item.quantity * item.product.price;
                totalPrice = +totalPrice.toFixed(2);
            });

            return User.updateOne(
                { _id: updatedUser._id },
                {
                    $set: {
                        cart: {
                            ...updatedUser.cart,
                            totalPrice
                        }
                    }
                }
            );
        })
        .then((result) => {
            console.log(result);
            res.redirect("/cart");
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "cart-delete-product" page using "POST" method
export const postDeleteCartItem = (req, res, next) => {
    let productID = req.body.productID;
    req.user
        .deleteCartItem(productID)
        .populate("cart.items.product")
        .then((user) => {
            const cartItems = user.cart.items;
            let totalPrice = 0;
            cartItems.forEach((item) => {
                totalPrice += item.quantity * item.product.price;
            });

            user.cart.totalPrice = totalPrice;
            return user.save();
        })
        .then((result) => {
            console.log(result);
            res.redirect("/cart");
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "orders" page using "GET" method
export const getOrders = (req, res, next) => {
    const userID = req.user._id;

    Order.find({ user: userID })
        .populate("user items.product", "-description -userId -cart -__v")
        // .populate("items.product", "-description -userId -__v")
        // .populate("user", "-cart -__v")
        .exec()
        .then((orders) => {
            res.render("./shop/orders", {
                pageTitle: "Your Orders",
                path: "/orders",
                orders: orders
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "orders/:orderId" page using "GET" method (To download order's invoice as a .pdf file)
export const getOrderInvoice = (req, res, next) => {
    const orderId = req.params.orderId;

    // Check user accessibility to order's invoices
    Order.findById(orderId)
        .populate("user", "_id name")
        .populate("items.product", "title")
        .then((order) => {
            if (!order) {
                return next(new Error("No order found"));
            }
            if (order.user._id.toString() !== req.user._id.toString()) {
                return next(
                    new Error(
                        "Unauthorized access: You don't have accessibility permission!"
                    )
                );
            }
            const invoiceName = `invoice_${orderId}.pdf`;
            const invoicePath = path.join(
                rootDir,
                "data",
                "invoices",
                invoiceName
            );

            const invoicePdfDoc = new pdfDocumnet({ margin: 30 });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `inline filename="${invoiceName}"`
            );
            invoicePdfDoc.pipe(fs.createWriteStream(invoicePath));
            invoicePdfDoc.pipe(res);

            // Create content of PDF
            invoicePdfDoc.fontSize(20).text("Your Invoice", {
                align: "center",
                color: "#44546A"
            });

            invoicePdfDoc.moveDown();

            // Add user information
            invoicePdfDoc.fontSize(16).text(`Username: ${order.user.name}`, {
                align: "left"
            });
            // invoicePdfDoc.text(`Date: 2025 - 04 - 12`);
            invoicePdfDoc.moveDown();

            let tableData = [];
            const tableHeaders = ["Items", "Quantity"];
            tableData.push(tableHeaders);
            order.items.forEach((item) => {
                let itemsTableData = [];
                itemsTableData[0] = item.product.title;
                itemsTableData[1] = item.quantity;
                tableData.push(itemsTableData);
            });

            const orderTotalPriceData = ["Total Price", `$${order.totalPrice}`];
            tableData.push(orderTotalPriceData);

            invoicePdfDoc.table({
                defaultStyle: { border: 1, borderColor: "gray" },
                rowStyles: (i) => {
                    if (i === tableData.length - 1)
                        return {
                            backgroundColor: "#ddd",
                            textColor: "blue"
                        };
                },
                data: tableData
            });

            // Finalize the PDF
            invoicePdfDoc.end();
        })
        .catch((err) => {
            throw next(err);
        });
};

// Access to "create-oerder" page using "POST" method
export const postOrder = (req, res, next) => {
    const userID = req.user._id;
    const cart = req.user.cart;

    const order = new Order({
        user: userID,
        items: [...cart.items],
        totalPrice: cart.totalPrice
    });

    order
        .save()
        .then((savedOrder) => {
            console.log(
                `Order with order id: ${savedOrder._id} created for you.`
            );
            return req.user.clearCart();
        })
        .then((savedUser) => {
            console.log(
                `The cart of user (user's id: ${savedUser._id}) cleared.`
            );
            res.redirect("/orders");
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "checkout/:orderId" page using "GET" method
export const getCheckout = (req, res, next) => {
    const orderID = req.params.orderId;
    Order.findById(orderID)
        .populate("user", "_id name email")
        .then((order) => {
            const user = order.user;
            res.render("./shop/checkout", {
                pageTitle: "Checkout Info",
                path: "/checkout",
                order: order,
                user: user
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};
