import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import signalRoutes from "./modules/signals/routers/signal.router.js";
import verificationRoutes from "./routes/signal.route.js";
import userRoutes from "./routes/user.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS must be first!
app.use(
    cors({
        origin: (origin, callback) => callback(null, origin || true),
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(morgan("dev"));
app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);

// Peter's signal feed (base): CRUD, voting, comments — owns the core /api/signals routes
app.use("/api/signals", signalRoutes);

// thit's trust layer: verify / trust stats / flag / moderation — unique sub-routes fall through here
app.use("/api/signals", verificationRoutes);

// thit's reputation & user routes
app.use("/api/users", userRoutes);

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
