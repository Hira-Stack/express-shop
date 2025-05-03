import { Router } from "express";
// import { check, body, param, query } from "express-validator";

import * as authController from "../controller/auth.js";
import * as validate from "../middleware/validate.js";

const router = Router();

// URL: "/login" => GET
router.get("/login", authController.getLogin);

// URL: "/login" => POST
router.post("/login", validate.loginValidator(), authController.postLogin);

// URL: "/signup" => GET
router.get("/signup", authController.getSignUp);

// URL: "/signup" => POST
router.post(
    "/signup",
    validate.signupEmailValidator(),
    validate.signupPasswordValidator(),
    authController.postSignUp
);

// URL: "/logout" => POST
router.post("/logout", authController.postLogout);

// URL: "/reset" => GET
router.get("/reset", authController.getResetPassword);

// URL: "/reset" => POST
router.post(
    "/reset",
    validate.emailResetValidator(),
    authController.postResetPassword
);

// URL: "/reset/:token" => GET
router.get("/reset/:token", authController.getNewPasswordForm);

// URL: "/new-password" => POST
router.post(
    "/new-password",
    validate.newPasswordValidator(),
    authController.postNewPassword
);

export default router;
