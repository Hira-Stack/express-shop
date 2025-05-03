import { body, param, query } from "express-validator";
import bcrypt from "bcrypt";

import User from "../models/user.js";

export const signupEmailValidator = () => {
    return (
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email.")
            .escape()
            // .normalizeEmail()
            .custom(async (value, { req }) => {
                const inputedEmail = value.toLowerCase();
                const users = await User.find({ email: inputedEmail });
                if (users.length !== 0) {
                    throw new Error(
                        "This email address already exist! Please try another."
                    );
                }
                return true;
            })
    );
};

export const signupPasswordValidator = () => {
    return (
        body("password")
            .isLength({ min: 6 })
            // .isAlphanumeric()
            .withMessage("Password length must be at least 6 character.")
            .custom((value, { req }) => {
                if (value !== req.body.confirmPassword) {
                    throw new Error(
                        "Password and Confirm Password doesn't match with together!"
                    );
                }
                // Check password characters
                // if (condition) {
                // }

                return true;
            })
    );
};

export const loginValidator = () => {
    return (
        body("email")
            .escape()
            // .normalizeEmail()
            .custom(async (value, { req }) => {
                const inputedEmail = value.toLowerCase();
                const user = await User.findOne({ email: inputedEmail });
                if (!user) {
                    throw new Error("User with this email is not exist.");
                }
                const isCorrectPassword = await bcrypt.compare(
                    req.body.password,
                    user.password
                );
                if (!isCorrectPassword) {
                    throw new Error(
                        "Password doesn't match! Please try again."
                    );
                }
                return true;
            })
    );
};

export const emailResetValidator = () => {
    return (
        body("email")
            .escape()
            // .normalizeEmail()
            .custom(async (value, { req }) => {
                const inputedEmail = value.toLowerCase();
                const user = await User.findOne({ email: inputedEmail });
                if (!user) {
                    throw new Error("There are no user with this E-mail!");
                }
                return true;
            })
    );
};

export const newPasswordValidator = () => {
    return (
        body("newPassword")
            .isLength({ min: 6 })
            // .isAlphanumeric()
            .withMessage("Password length must be at least 6 character.")
            .custom((newPassword, { req }) => {
                if (newPassword !== req.body.confirmNewPassword) {
                    throw new Error(
                        "Password and Confirm Password doesn't match with together!"
                    );
                }
                // Check password characters
                // if (condition) {
                // }

                return true;
            })
    );
};

// Add or Edit product validation

export const productTitleValidator = () => {
    return body("title")
        .isLength({ min: 3, max: 80 })
        .withMessage(
            "The product's title should have a minimum of 3 characters and a maximum of 80 characters."
        )
        .escape()
        .trim();
    // .custom((value, { req }) => {
    //     // check value string pattern using RegEx
    //     // if (condition) {
    //     // }
    // });
};

export const productImageUrlValidator = () => {
    return body("image").custom((imageUrl, { req }) => {
        const allowedExtensions = [".png", ".jpg", ".jpeg"];

        if (!req.file) {
            throw new Error("No file provided!");
        }

        const fileExtension =
            "." + req.file.originalname.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error(
                `Only ${allowedExtensions.join(", ")} files are allowed.`
            );
        }

        return true;
    });
};

export const productPriceValidator = () => {
    return body("price")
        .isFloat()
        .withMessage("Price should be a floating number!");
};

export const productDescriptionValidator = () => {
    return body("description")
        .isLength({ min: 5, max: 400 })
        .withMessage(
            "The product's description can have a minimum of 5 characters and a maximum of 400 characters."
        )
        .escape()
        .trim();
};
