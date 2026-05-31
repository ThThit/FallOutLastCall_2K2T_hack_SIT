import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Auth is carried entirely by the httpOnly `token` cookie the server sets on
// login/register. `withCredentials` makes the browser send it automatically —
// the JWT is never stored in or read from JS (XSS-safe).
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const client = axiosInstance;

// Returns the current user based on the token cookie, or throws on 401.
export const getMe = async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data; // { success, user }
};

// --- Auth ---
export const registerUser = async (
    userName: string,
    password: string,
    sector?: number,
) => {
    try {
        const response = await axiosInstance.post("/auth/register", {
            userName,
            password,
            sector,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || "Registration failed");
    }
};

export const loginUser = async (username: string, password: string) => {
    try {
        const response = await axiosInstance.post("/auth/login", {
            userName: username,
            password,
        });
        // No token handling here — the server sets the httpOnly cookie.
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || "Login failed");
    }
};

export const logoutUser = async () => {
    try {
        // The server clears the httpOnly cookie on this call.
        const response = await axiosInstance.post("/auth/logout");
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || "Logout failed");
    }
};
