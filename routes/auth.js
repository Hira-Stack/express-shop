import { Router } from "express";

import * as authController from "../controller/auth.js";

const router = Router();

// URL: "/login" => GET
router.get("/login", authController.getLogin);

// URL: "/login" => POST
router.post("/login", authController.postLogin);

// URL: "/logout" => POST
router.post("/logout", authController.postLogout);

export default router;
