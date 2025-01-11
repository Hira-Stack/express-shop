import path from "path";
import express from "express";

/** The "body-parser" package there is with Express by default,
 * but add it as third-party package is best practice.
 */
import bodyParser from "body-parser";
import { rootDir } from "./util/paths.js";

import sequelize from "./util/database.js";
import Product from "./models/product.js";
import User from "./models/user.js";
import Cart from "./models/cart.js";
import CartItem from "./models/cart-item.js";
import Order from "./models/order.js";
import OrderItem from "./models/order-item.js";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import { get404 } from "./controller/errors.js";

const app = express();

// Set View Engin to "EJS" (Template Engine)
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, "public")));

// Use a middleware to store user???
app.use((req, res, next) => {
    User.findByPk(1)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.error(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404 Error
app.use(get404);

// *** Models associations ***
// User and Product association
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

// User and Cart association
Cart.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasOne(Cart);

// Cart and Product association
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// User and Order association
Order.belongsTo(User);
User.hasMany(Order);

// Cart and Product association
Order.belongsToMany(Product, { through: OrderItem });

sequelize
    // .sync({ force: true })
    .sync()
    .then((result) => {
        return User.findByPk(1);
    })
    .then((user) => {
        if (!user) {
            return User.create({ name: "Hamid", email: "hira@gmail.com" });
        }
        return user;
    })
    .then((user) => {
        Cart.findOne({ where: { userId: user.id } })
            .then((cart) => {
                if (!cart) {
                    user.createCart();
                }
                app.listen(8080);
            })
            .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
