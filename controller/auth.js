import crypto from "crypto";

import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

import User from "../models/user.js";
import transporter, { setMailOptions } from "../mail-server.js";

// Access to "Login" page using "GET" method and "/login" url
export const getLogin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect("/");
    }

    // Check flash messages
    const errorMessage = req.flash("error-message");
    const successmessage = req.flash("success-message");
    const flashMessage = errorMessage[0] ?? successmessage[0];

    res.render("./auth/login", {
        pageTitle: "Login",
        path: "/login",
        flashMessage: flashMessage,
        previousInputs: { email: "" },
        validationErrors: []
    });
};

// Access to "Login" page using "POST" method and redirect to "/" url
export const postLogin = (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        const status422 = res.status(422);
        console.log(errors.array());
        return status422.render("./auth/login", {
            pageTitle: "Login",
            path: "/login",
            flashMessage: errors.array()[0]?.msg,
            previousInputs: { email },
            validationErrors: errors.array()
        });
        // req.flash("error-message", errors.array()[0].msg);
        // return res.redirect("/login");
    }

    User.findOne({ email: email })
        .then((user) => {
            console.log("You are logged in successfully.");
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((err) => {
                if (err) {
                    throw new Error(err);
                }
                return res.redirect("/");
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "SignUp" page using "GET" method and "/signup" url
export const getSignUp = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect("/");
    }

    const flashMessage = req.flash("error-message")[0];
    res.render("./auth/signup", {
        pageTitle: "Sign Up",
        path: "/signup",
        flashMessage: flashMessage,
        previousInputs: { name: "", email: "" },
        validationErrors: []
    });
};

// Access to "SignUp" page using "POST" method and redirect to "/" url
export const postSignUp = (req, res, next) => {
    const name = req.body.username;
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    // const confirmPassword = req.body.confirmPassword;
    const cart = { items: [], totalPrice: 0 };
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        const status422 = res.status(422);
        return status422.render("./auth/signup", {
            pageTitle: "Sign Up",
            path: "/signup",
            flashMessage: errors.array()[0]?.msg,
            previousInputs: { name, email },
            validationErrors: errors.array()
        });
    }

    const mailOptions = setMailOptions(
        email,
        "Express Shop Registration Code",
        `This is your registeration code: ${1234}`
    );

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            throw new Error(err);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                name,
                email,
                password: hashedPassword,
                cart
            });

            return user.save();
        })
        .then((user) => {
            console.log(user);
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    return res.redirect("/login");
};

// Access to "Log Out" page using "POST" method and redirect to "/" url
export const postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
};

// Access to "Reset Password" page using "GET" method and "/reset" url
export const getResetPassword = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect("/");
    }

    const flashMessage = req.flash("error-message")[0];
    res.render("./auth/reset", {
        pageTitle: "Reset Password",
        path: "/reset",
        flashMessage: flashMessage,
        previousInputs: { email: "" },
        validationErrors: []
    });
};

// Access to "Reset Password" page using "POST" method and redirect to "/login" url
export const postResetPassword = (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const errors = validationResult(req);

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                req.flash(
                    "error-message",
                    "There are no user with this E-mail!"
                );
                // return res.redirect("/reset");
                const status422 = res.status(422);
                return status422.render("./auth/reset", {
                    pageTitle: "Reset Password",
                    path: "/reset",
                    flashMessage: errors.array()[0]?.msg,
                    previousInputs: { email },
                    validationErrors: errors.array()
                });
            }
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    console.log(err);
                    return res.redirect("/reset");
                }
                const token = buffer.toString("hex");
                user.resetPasswordToken = token;
                user.resetPasswordTokenExp = Date.now() + 1800000;
                return user
                    .save()
                    .then((result) => {
                        const resetUrl = `http://${req.headers.host}${req.url}/${result.resetPasswordToken}`;
                        const mailOptions = setMailOptions(
                            email,
                            "Express Shop - Reset Password URL",
                            `Click on below url and reset your password:\n${resetUrl}`
                        );

                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                req.flash(
                                    "error-message",
                                    "There is a problem. We can't send to your email."
                                );
                                // ! Error status code is 500 ?
                                console.log(err);
                                const error = new Error(err);
                                error.httpStatusCode = 500;
                                return next(error);
                            } else {
                                console.log(`Email sent: ${info.response}`);
                                req.flash(
                                    "success-message",
                                    "Reset url link sent to your email."
                                );
                            }
                            return res.redirect("/login");
                        });
                    })
                    .catch((err) => {
                        throw new Error(err);
                    });
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "Reset New Password" page using "GET" method and "/reset" url
export const getNewPasswordForm = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExp: { $gt: Date.now() }
    })
        .then((user) => {
            if (!user) {
                req.flash(
                    "error-message",
                    "This user token is invalid or Expired!"
                );
                res.redirect("/reset");
            }
            // const flashMessage = req.flash("error-message")[0];
            const errors = validationResult(req);
            res.render("./auth/new-password-form", {
                pageTitle: "Set New Password",
                path: "/reset",
                userId: user._id.toString(),
                passwordToken: token,
                flashMessage: errors.array()[0]?.msg,
                validationErrors: []
            });
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

// Access to "Set New Password" page using "POST" method and redirect to "/login" url
export const postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    const newPassword = req.body.newPassword;
    let hashedPassword;
    const errors = validationResult(req);

    bcrypt
        .hash(newPassword, 12)
        .then((hashPass) => {
            hashedPassword = hashPass;
            return User.findById(userId);
        })
        .then((user) => {
            if (!errors.isEmpty()) {
                console.log(errors.array());
                const status422 = res.status(422);
                return status422.render("./auth/new-password-form", {
                    pageTitle: "Set New Password",
                    path: "/reset",
                    userId: user._id.toString(),
                    passwordToken: token,
                    flashMessage: errors.array()[0]?.msg,
                    validationErrors: errors.array()
                });
            }
            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordTokenExp = null;
            req.flash("success-message", "Your password changed successfully!");
            return user.save();
        })
        .then((result) => {
            console.log(result);
            if (!result) {
                throw new Error(
                    "There was a problem changing your password! Please try again."
                );
            }
            return res.redirect("/login");
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
