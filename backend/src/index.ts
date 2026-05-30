import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import singalRoutes from "./routes/signal.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS must be first!
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(morgan("dev"));
app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use("/api/auth", authRoutes);

// signal routes
app.use('/api/signals', singalRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Error handling middleware
app.use(
    (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        console.error(err);
        res.status(err.status || 500).json({
            error: err.message || "Internal server error",
        });
    },
);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
