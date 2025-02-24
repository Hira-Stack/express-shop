import User from "../models/user.js";
import { isLoggedIn } from "../util/auth.js";

// Access to "Login" page using "GET" method and "/login" url
export const getLogin = (req, res, next) => {
    res.render("./auth/login", {
        pageTitle: "Login",
        path: "/login",
        isAuthenticated: isLoggedIn(req)
    });
};

// Access to "Login" page using "POST" method and redirect to "/" url
export const postLogin = (req, res, next) => {
    User.findById("67a5d98405845b1775019e4c")
        .then((user) => {
            if (!user) {
                throw new Error("User not found!");
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((err) => {
                if (err) {
                    console.log(err);
                }
                res.redirect("/");
            });
        })
        .catch((err) => console.error(err));
};

// Access to "logout" page using "POST" method and redirect to "/" url
export const postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
};
