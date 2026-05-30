import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser } from '../api/client';

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode; }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is already logged in on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await loginUser(username, password);
            const userData = { id: response.user.id, username: response.user.username };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await registerUser(username, password);
            const userData = { id: response.user.id, username: response.user.username };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err: any) {
            const errorMessage = err.message || 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await logoutUser();
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (err: any) {
            const errorMessage = err.message || 'Logout failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isLoading,
                error,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
