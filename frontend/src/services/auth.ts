const API_BASE_URL = "http://localhost:3000/api";

export const authAPI = {
  // Register a new user
  register: async (userName: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }
    return response.json();
  },

  // Login user
  login: async (userName: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }
    return response.json();
  },

  // Logout user
  logout: async () => {
    const authToken = localStorage.getItem("authToken");
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) throw new Error("Logout failed");
    return response.json();
  },

  // Store token and user info
  setAuth: (token: string, user: any) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userId", user.id);
  },

  // Clear auth on logout
  clearAuth: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  },

  // Get stored token
  getToken: () => localStorage.getItem("authToken"),

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
