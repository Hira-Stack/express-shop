import Product from "../models/product.js";
import { isLoggedIn } from "../util/auth.js";

// Access to "Add Product" page using "GET" method and "/admin/add-product" url
export const getAddProduct = (req, res, next) => {
    res.render("./admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        isAuthenticated: isLoggedIn(req)
    });
};

// Access to "Add Product" page using "POST" method and "/admin/add-product" url
export const postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = +req.body.price;
    const description = req.body.description;
    const userId = req.user;

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
        .catch((err) => console.error(err));
};

// Access to "Edit Product" page using "GET" method and "/admin/edit-product" url
export const getEditProduct = (req, res, next) => {
    const editMode = Boolean(req.query.edit);
    if (!editMode) {
        return res.redirect("/");
    }

    const productID = req.params.productID;
    Product.findById(productID)
        .then((product) => {
            if (!product) {
                return res.redirect("/");
            }
            res.render("./admin/edit-product", {
                pageTitle: `Edit Product: ${product.title}`,
                path: "/admin/edit-product",
                editing: editMode,
                product: product,
                isAuthenticated: isLoggedIn(req)
            });
        })
        .catch((err) => console.error(err));
};

// Access to "Edit Product" page using "POST" method and "/admin/edit-product" url
export const postEditProduct = (req, res, next) => {
    const productID = req.body.productID;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    Product.findByIdAndUpdate(productID, {
        title,
        imageUrl,
        price,
        description
    })
        .then((result) => {
            console.log(
                `Product with ID: "${result._id}" updated successfully.`
            );
            res.redirect("/admin/products");
        })
        .catch((err) => console.error(err));
};

// Access to "Delete Product" page using "GET" method and "/admin/delete-product" url
export const postDeleteProduct = (req, res, next) => {
    const productID = req.body.productID;

    Product.findByIdAndDelete(productID)
        .then((result) => {
            res.redirect("/admin/products");
        })
        .catch((err) => console.error(err));
};

// Access to "products" page using "GET" method and "/admin/products" url
export const getAdminProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render("./admin/products", {
                products: products,
                pageTitle: "Admin Products",
                path: "/admin/products",
                isAuthenticated: isLoggedIn(req)
            });
        })
        .catch((err) => console.error(err));
};
