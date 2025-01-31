// import User from "../models/user.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";
import Order from "../models/order.js";

// Access to "shop" page using "GET" method
export const getShopIndex = (req, res, next) => {
    Product.fetchAll()
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
    Product.fetchAll()
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

    Product.findById(productID)
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
    const cart = req.user.cart;

    res.render("./shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: cart.items,
        totalPrice: cart.totalPrice
    });
};

// Access to "cart" page using "POST" method
export const postCart = (req, res, next) => {
    const userID = req.user._id.toString();
    const productID = req.body.productID;
    let fetchedCart = req.user.cart;
    const userCart = new Cart(fetchedCart.items);

    userCart
        .addProduct(productID)
        .then((cart) => {
            return cart.updateByUserId(userID);
        })
        .then((result) => {
            console.log(result);
            res.redirect("/cart");
        })
        .catch((err) => console.error(err));
};

// Access to "cart-delete-product" page using "POST" method
export const postCartDeleteProduct = (req, res, next) => {
    const productID = req.body.productID;
    const userID = req.user._id.toString();
    const fetchedCart = req.user.cart;

    const cart = new Cart(fetchedCart.items);
    cart.deleteItem(productID)
        .updateByUserId(userID)
        .then((result) => {
            console.log(result);
            res.redirect("/cart");
        })
        .catch((err) => console.error(err));
};

// Access to "orders" page using "GET" method
export const getOrders = (req, res, next) => {
    const userID = req.user._id.toString();

    Order.findByUserId(userID)
        .then((orders) => {
            console.log(orders);
            res.render("./shop/orders", {
                pageTitle: "Your Orders",
                path: "/orders",
                orders: orders
            });
        })
        .catch((err) => console.error(err));
};

// Access to "create-oerder" page using "POST" method
export const postOrder = (req, res, next) => {
    const userID = req.user._id;
    const userCart = req.user.cart;

    const order = new Order(userID, userCart.items, userCart.totalPrice);

    order
        .save()
        .then((result) => {
            const emptyCart = new Cart();
            const userID = req.user._id.toString();
            return emptyCart.updateByUserId(userID);
        })
        .then((result) => {
            console.log(result);
            res.redirect("/orders");
        })
        .catch((err) => console.error(err));
};

// Access to "checkout" page using "GET" method
// export const getCheckout = (req, res, next) => {
//     res.render("./shop/checkout", {
//         pageTitle: "Checkout Info",
//         path: "/checkout"
//     });
// };
