import { create } from 'zustand';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: { username: string } | null;
    isAuthenticated: boolean;
    setAuth: (accessToken: string, refreshToken: string, username: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: localStorage.getItem('username') ? { username: localStorage.getItem('username')! } : null,
    isAuthenticated: !!localStorage.getItem('token'),
    setAuth: (token: string, refreshToken: string, username: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('username', username);
        set({ token, refreshToken, user: { username }, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
    },
}));
