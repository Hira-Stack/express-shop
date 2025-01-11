import Product from "../models/product.js";

// Access to "Add Product" page using "GET" method and "/admin/add-product" url
export const getAddProduct = (req, res, next) => {
    res.render("./admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false
    });
};

// Access to "Add Product" page using "POST" method and "/admin/add-product" url
export const postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    req.user
        .createProduct({
            title: title,
            imageUrl: imageUrl,
            price: price,
            description: description,
            userId: req.user.id
        })
        .then((result) => {
            console.log(`Product with title: "${title}" created successfully.`);
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
    req.user
        .getProducts({ where: { id: productID } })
        .then((products) => {
            const product = products[0];
            if (!product) {
                return res.redirect("/");
            }
            res.render("./admin/edit-product", {
                pageTitle: `Edit Product: ${product.title}`,
                path: "/admin/edit-product",
                editing: editMode,
                product: product
            });
        })
        .catch((err) => {
            console.error(err);
        });
};

// Access to "Edit Product" page using "POST" method and "/admin/edit-product" url
export const postEditProduct = (req, res, next) => {
    const productID = req.body.productID;
    const productTitle = req.body.title;
    const productImageURL = req.body.imageUrl;
    const productPrice = req.body.price;
    const productDescription = req.body.description;

    Product.update(
        {
            title: productTitle,
            imageUrl: productImageURL,
            price: productPrice,
            description: productDescription
        },
        {
            where: { id: productID }
        }
    )
        .then((result) => {
            res.redirect("/admin/products");
        })
        .catch((err) => console.error(err));
};

// Access to "Delete Product" page using "GET" method and "/admin/delete-product" url
export const postDeleteProduct = (req, res, next) => {
    const productID = req.body.productID;

    Product.destroy({
        where: {
            id: productID
        }
    })
        .then((result) => {
            console.log(
                `Product with ID: "${productID}" deleted successfully.`
            );
            res.redirect("/admin/products");
        })
        .catch((err) => {
            console.error(err);
        });
};

// Access to "products" page using "GET" method and "/admin/products" url
export const getAdminProducts = (req, res, next) => {
    req.user
        .getProducts()
        .then((products) => {
            res.render("./admin/products", {
                products: products,
                pageTitle: "Admin Products",
                path: "/admin/products"
            });
        })
        .catch((err) => console.log(err));
};
