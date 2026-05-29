import { Router } from "express";
import {
    registerController,
    loginController,
    logoutController,
} from "../controllers/auth.controller.js";

const router = Router();

// Register a new user
router.post("/register", registerController);

// Login user
router.post("/login", loginController);

// Logout user
router.post("/logout", logoutController);

export default router;
