import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";

// Access to "shop" page using "GET" method
export const getShopIndex = (req, res, next) => {
    Product.find()
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
    Product.find()
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
        .catch((err) => console.error(err));
};

// Access to "cart" page using "POST" method
export const postCart = (req, res, next) => {
    const userID = req.user._id.toString();
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
        .catch((err) => console.error(err));
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
        .catch((err) => console.error(err));
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
        .catch((err) => console.error(err));
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
            console.log(savedOrder);
            const emptyCart = { items: [], totalPrice: 0.0 };
            req.user.cart = { ...emptyCart };
            return req.user.save();
        })
        .then((savedUser) => {
            console.log(savedUser);
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
