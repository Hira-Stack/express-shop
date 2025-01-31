import path from "path";

import express from "express";
import "dotenv/config.js";

import { clientConnect } from "./util/database.js";

/** The "body-parser" package there is with Express by default,
 * but add it as third-party package is best practice.
 */
import bodyParser from "body-parser";
import { rootDir } from "./util/paths.js";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";

import { get404 } from "./controller/errors.js";

const app = express();

// Models
import User from "./models/user.js";
import Cart from "./models/cart.js";
import Product from "./models/product.js";

// Set View Engin to "EJS" (Template Engine)
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, "public")));

// Use a middleware to store user???
app.use((req, res, next) => {
    User.findById("678ea8d529a83f98c8f654fd")
        .then((user) => {
            if (!user) {
                const username = "Hamidreza";
                const userEmail = "Hira.stack@gmail.com";
                const userCart = new Cart();
                user = new User(username, userEmail, userCart);
                user.save();
            }
            req.user = user;

            next();
        })
        .catch((err) => console.error(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404 Error
app.use(get404);

clientConnect((client) => {})
    .then((result) => {
        app.listen(8080);
    })
    .catch((err) => console.error(err));
