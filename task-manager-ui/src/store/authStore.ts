import { create } from 'zustand';

interface AuthState {
    token: string | null;
    user: { username: string } | null;
    isAuthenticated: boolean;
    setAuth: (token: string, username: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('username') ? { username: localStorage.getItem('username')! } : null,
    isAuthenticated: !!localStorage.getItem('token'),
    setAuth: (token: string, username: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        set({ token, user: { username }, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        set({ token: null, user: null, isAuthenticated: false });
    },
}));
