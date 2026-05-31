import { Router } from "express";
import {
    registerController,
    loginController,
    logoutController,
    meController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Register a new user
router.post("/register", registerController);

// Login user
router.post("/login", loginController);

// Logout user
router.post("/logout", logoutController);

// Current user (rehydrates the session from the token cookie)
router.get("/me", authMiddleware, meController);

export default router;
