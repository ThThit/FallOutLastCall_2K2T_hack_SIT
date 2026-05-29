import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export class AuthService {
    /**
     * Register a new user
     */
    async register(username: string, password: string) {
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            throw new Error("This username is already taken");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                reputationScore: 0,
            },
        });

        return {
            id: user.id,
            username: user.username,
        };
    }

    /**
     * Login user and generate JWT token
     */
    async login(username: string, password: string) {
        // Find user by username
        const user = await prisma.user.findUnique({ where: { username } });

        // Check if account exists
        if (!user) {
            throw new Error("This username does not exist");
        }

        // Validate password
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            throw new Error("The password does not match");
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" },
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }

    /**
     * Logout user
     */
    async logout(userId: string) {
        return { success: true };
    }

    /**
     * Verify JWT token
     */
    verifyToken(token: string): { id: string; username: string; } {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                id: string;
                username: string;
            };
            return decoded;
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
}

export default new AuthService();
