import { Request, Response } from "express";
import authService from "../services/auth.service.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;

    // Validation
    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userName, password",
      });
    }

    // Username validation: must contain numbers and #
    const usernameRegex = /^[a-zA-Z0-9#]+#[0-9]+$/;
    if (!usernameRegex.test(userName)) {
      return res.status(400).json({
        success: false,
        error:
          "Username must contain letters/numbers and # with digits (e.g., thit#213)",
      });
    }

    // Register user
    const user = await authService.register(userName, password);

    // Generate JWT token for immediate use
    const result = await authService.login(userName, password);

    // Set JWT token as HTTP-only cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;

    // Validation
    if (!userName || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: username, password",
      });
    }

    // Login user
    const result = await authService.login(userName, password);

    // Set JWT token as HTTP-only cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Login error:", error);

    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
