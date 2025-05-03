import path from "path";

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import flash from "connect-flash";
import csrf from "csurf";
import multer from "multer";
import "dotenv/config.js";
/** The "body-parser" package there is with Express by default,
 * but add it as third-party package is best practice.
 */
import bodyParser from "body-parser";

import { rootDir, imagesDir } from "./util/paths.js";

import adminRoutes from "./routes/admin.js";
import shopRoutes from "./routes/shop.js";
import authRoutes from "./routes/auth.js";
import { get404, get500 } from "./controller/errors.js";

// Models
import User from "./models/user.js";

const app = express();
const MongoDBStore = ConnectMongoDBSession(session);
const store = MongoDBStore({
    uri: process.env.DB_URI,
    collection: "sessions"
});

// CSRF attacks protection (Used default options)
const csrfProtection = csrf();

// File storage configurations
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.substring(
            file.originalname.lastIndexOf(".")
        );
        cb(
            null,
            "Image" + "_" + new Date().toISOString().replace(/:/g, "-") + ext
        );
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Set View Engin to "EJS" (Template Engine)
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// Serve static files
app.use(express.static(path.join(rootDir, "public")));
// app.use(express.static(path.join(rootDir, "Uploads/Images")));

// Session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

// CSRF protection middleware
app.use(csrfProtection);

// Save flash messages into session
app.use(flash());

// Set frequently used local properties in views using express middleware
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session?.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Adding user to the request unsing middleware
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch((err) => {
            // throw new Error(err);
            // ! Error handling in this case should be improved ...
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Handle 500 Status Code Error
app.get("/500", get500);

// Handle 404 Error
app.use(get404);

// Handle Error Middleware
app.use((error, req, res, next) => {
    // res.redirect("/500");
    console.log(error);
    const status500 = res.status(500);
    return status500.render("500", {
        pageTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
});

mongoose
    .connect(process.env.DB_URI)
    .then((result) => {
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => console.error(err));
