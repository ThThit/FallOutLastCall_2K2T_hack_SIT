import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Add JWT token to requests
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const client = axiosInstance;

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
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            // vivi's vault/trade services read the token under "authToken"
            localStorage.setItem("authToken", response.data.token);
        }
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || "Login failed");
    }
};

export const logoutUser = async () => {
    try {
        const response = await axiosInstance.post("/auth/logout");
        localStorage.removeItem("token");
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || "Logout failed");
    }
};
