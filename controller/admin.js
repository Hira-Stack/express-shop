import { validationResult } from "express-validator";

import Product from "../models/product.js";
import { removeFile } from "../util/files.js";

// Maximum number of item that should be shown on each page
const MAX_ITEMS_PER_PAGE = 3;

// Access to "Add Product" page using "GET" method and "/admin/add-product" url
export const getAddProduct = (req, res, next) => {
    res.render("./admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        flashMessage: ""
    });
};

// Access to "Add Product" page using "POST" method and "/admin/add-product" url
export const postAddProduct = (req, res, next) => {
    const title = req.body.title;
    // const imageUrl = req.body.imageUrl;
    const image = req.file;
    const price = +req.body.price;
    const description = req.body.description;
    const userId = req.user;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const flashMessage = errors.array()[0].msg;
        const status422 = res.status(422);
        return status422.render("./admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            hasError: true,
            flashMessage: flashMessage,
            product: {
                title,
                price,
                description,
                userId
            }
        });
    }

    // const imageUrl = image.path;
    const imageUrl = image.path.split("public\\").join("");
    const newProduct = new Product({
        title,
        imageUrl,
        price,
        description,
        userId
    });
    newProduct
        .save()
        .then((savedProduct) => {
            console.log(
                `New product created successfully.\n` +
                    `Product ID: ${savedProduct._id}\n` +
                    `Title: ${savedProduct.title}`
            );
            res.redirect("/admin/products");
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "Edit Product" page using "GET" method and "/admin/edit-product" url
export const getEditProduct = (req, res, next) => {
    const editMode = Boolean(req.query.edit);
    if (!editMode) {
        return res.redirect("/");
    }

    const productID = req.params.productID;
    const userID = req.user._id;
    Product.findOne({ _id: productID, userId: userID })
        .then((product) => {
            if (!product) {
                return res.redirect("/");
            }
            res.render("./admin/edit-product", {
                pageTitle: `Edit Product: ${product.title}`,
                path: "/admin/edit-product",
                editing: editMode,
                hasError: false,
                flashMessage: "",
                product: product
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "Edit Product" page using "POST" method and "/admin/edit-product" url
export const postEditProduct = (req, res, next) => {
    const productID = req.body.productID;
    const userID = req.user._id;
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const flashMessage = errors.array()[0].msg;
        const status422 = res.status(422);
        return status422.render("./admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: true,
            hasError: true,
            flashMessage: flashMessage,
            product: {
                _id: productID,
                title: title,
                price: price,
                description: description
            }
        });
    }

    const imageUrl = image.path.split("public\\").join("");
    let previousImageUrl = "";
    Product.findOne({ _id: productID, userId: userID })
        .then((product) => {
            previousImageUrl = product.imageUrl;

            // Update product info
            product.title = title;
            product.imageUrl = imageUrl;
            product.price = price;
            product.description = description;

            return product.save();
        })
        .then((result) => {
            console.log(
                `Product with ID: "${result._id}" updated successfully.`
            );
            previousImageUrl = previousImageUrl.split("\\");
            const directoryPath = previousImageUrl[0];
            const fileName = previousImageUrl[1];

            res.redirect("/admin/products");

            // Remove previous product's image file
            removeFile(directoryPath, fileName);
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "Delete Product" page using "GET" method and "/admin/delete-product" url
export const deleteProduct = (req, res, next) => {
    const productID = req.params.productID;
    const userID = req.user._id;

    Product.findOneAndDelete({ _id: productID, userId: userID })
        .then((product) => {
            if (!product) {
                return next(new Error("Product not found!"));
            }
            let previousImageUrl = product.imageUrl;
            previousImageUrl = previousImageUrl.split("\\");
            const directoryPath = previousImageUrl[0];
            const fileName = previousImageUrl[1];

            // res.redirect("/admin/products");
            res.status(200).json({ message: "Success msg." });

            // Remove previous product's image file
            removeFile(directoryPath, fileName);
        })
        .catch((err) => {
            res.status(500).json({ message: "Delete product failed!" });
            // res.status(500).json({ message: err.message });
        });
};

// Access to "products" page using "GET" method and "/admin/products" url
export const getAdminProducts = (req, res, next) => {
    const userID = req.user._id;
    const page = +req.query.page || 1;
    let totalProductItems = 0;

    Product.find({ userId: userID })
        .countDocuments()
        .then((numberOfProducts) => {
            totalProductItems = numberOfProducts;

            return Product.find({ userId: userID })
                .skip((page - 1) * MAX_ITEMS_PER_PAGE)
                .limit(MAX_ITEMS_PER_PAGE);
        })
        .then((products) => {
            res.render("./admin/products", {
                products: products,
                pageTitle: "Admin Products",
                path: "/admin/products",
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
