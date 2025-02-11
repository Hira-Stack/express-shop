import path from "path";

import express from "express";
import mongoose from "mongoose";
import "dotenv/config.js";

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

// Set View Engin to "EJS" (Template Engine)
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, "public")));

// Use a middleware to store user???
app.use((req, res, next) => {
    User.findById("67a5d98405845b1775019e4c")
        .then((user) => {
            if (!user) {
                const name = "Hamidreza";
                const email = "Hira.stack@gmail.com";
                const cart = { items: [], totalPrice: 0.0 };
                user = new User({ name, email, cart });
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

mongoose
    .connect(process.env.DB_URI)
    .then((result) => {
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => console.error(err));
