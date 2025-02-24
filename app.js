import path from "path";

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
// import { MongoDBStore } from "connect-mongodb-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import "dotenv/config.js";

/** The "body-parser" package there is with Express by default,
 * but add it as third-party package is best practice.
 */
import bodyParser from "body-parser";
import { rootDir } from "./util/paths.js";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import authRoutes from "./routes/auth.js";
import { get404 } from "./controller/errors.js";

// Models
import User from "./models/user.js";

const app = express();
const MongoDBStore = ConnectMongoDBSession(session);
const store = MongoDBStore({
    uri: process.env.DB_URI,
    collection: "sessions"
});

// Set View Engin to "EJS" (Template Engine)
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, "public")));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// Use a middleware to store user???
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.error(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Handle 404 Error
app.use(get404);

mongoose
    .connect(process.env.DB_URI)
    .then((result) => {
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => console.error(err));
