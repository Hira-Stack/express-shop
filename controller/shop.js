import Product from "../models/product.js";
import Order from "../models/order.js";

// Access to "shop" page using "GET" method
export const getShopIndex = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render("./shop/index", {
                products: products,
                pageTitle: "Shop",
                path: "/"
            });
        })
        .catch((err) => console.error(err));
};

// Access to "products" page using "GET" method
export const getProducts = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            res.render("./shop/product-list", {
                products: products,
                pageTitle: "All Products",
                path: "/products"
            });
        })
        .catch((err) => console.error(err));
};

// Access to "products/:productID" page using "GET" method (By unique product ID)
export const getSingleProduct = (req, res, next) => {
    const productID = req.params.productID;

    Product.findByPk(productID)
        .then((product) => {
            res.render("./shop/product-detail", {
                product: product,
                pageTitle:
                    product !== null ? product.title : "Product Not Found",
                path: "/products"
            });
        })
        .catch((err) => console.error(err));
};

// Access to "cart" page using "GET" method
export const getCart = (req, res, next) => {
    req.user
        .getCart()
        .then((cart) => {
            return cart
                .getProducts()
                .then((products) => {
                    res.render("./shop/cart", {
                        pageTitle: "Your Cart",
                        path: "/cart",
                        products: products,
                        totalPrice: cart.totalPrice
                    });
                })
                .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
};

// Access to "cart" page using "POST" method
export const postCart = (req, res, next) => {
    const productID = req.body.productID;
    let fetchedCart;
    let newQuantity = 1;

    req.user
        .getCart()
        .then((cart) => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productID } });
        })
        .then((products) => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                const oldQuantity = product["Cart-Item"].quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productID);
        })
        .then((product) => {
            const productPrice = product.price;
            fetchedCart.totalPrice += productPrice;
            fetchedCart.totalPrice = fetchedCart.totalPrice.toFixed(2);
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity }
            });
        })
        .then((data) => {
            fetchedCart.save();
            res.redirect("/cart");
        })
        .catch((err) => console.error(err));
};

// Access to "cart-delete-product" page using "POST" method
export const postCartDeleteProduct = (req, res, next) => {
    const productID = req.body.productID;
    // let fetchedCart;

    req.user
        .getCart()
        .then((cart) => {
            return cart.getProducts({ where: { id: productID } });
        })
        .then((products) => {
            let product = products[0];
            return product["Cart-Item"].destroy();
        })
        .then((result) => {
            console.log(
                `Product item with ID: ${result.productId} removed from cart successfully.`
            );
            res.redirect("/cart");
        })
        .catch((err) => console.error(err));
};

// Access to "oerders" page using "GET" method
export const getOrders = (req, res, next) => {
    req.user
        .getOrders({ include: ["Products"] })
        .then((orders) => {
            res.render("./shop/orders", {
                pageTitle: "Your Oreders",
                path: "/orders",
                orders: orders
            });
        })
        .catch((err) => console.error(err));
};

// Access to "create-oerder" page using "POST" method
export const postOrder = (req, res, next) => {
    let fetchedCart;
    let cartProducts;
    let cartTotalPrice = 0;

    req.user
        .getCart()
        .then((cart) => {
            fetchedCart = cart;
            cartTotalPrice = cart.totalPrice;
            return cart.getProducts();
        })
        .then((products) => {
            cartProducts = products;
            return req.user.createOrder();
        })
        .then(async (order) => {
            order.totalPrice = cartTotalPrice;
            await order.save();

            return order.addProducts(
                cartProducts.map((product) => {
                    product["Order-Item"] = {
                        quantity: product["Cart-Item"].quantity
                    };
                    return product;
                })
            );
        })
        .then((products) => {
            return fetchedCart.setProducts(null);
        })
        .then((result) => {
            // fetchedCart = null;
            res.redirect("/orders");
        })
        .catch((err) => console.log(err));
};

// Access to "checkout" page using "GET" method
// export const getCheckout = (req, res, next) => {
//     res.render("./shop/checkout", {
//         pageTitle: "Checkout Info",
//         path: "/checkout"
//     });
// };
