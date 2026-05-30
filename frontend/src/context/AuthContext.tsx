import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser } from '../api/client';

interface User {
    id: string;
    username: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isModerator: boolean;
    isLoading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            const userData: User = {
                id: response.user.id,
                username: response.user.username,
                role: response.user.role ?? 'USER',
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err: any) {
            setError(err.message || 'Login failed');
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
            const userData: User = {
                id: response.id,
                username: response.username,
                role: response.role ?? 'USER',
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err: any) {
            setError(err.message || 'Registration failed');
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
        } catch {
            // ignore logout errors
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    const isModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN';

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isModerator: !!isModerator,
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
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
