import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import type { AuthResponse } from '../types';

const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<AuthResponse>('/auth/login', data);
            setAuth(response.data.token);
            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cyber-black px-4">
            <div className="max-w-md w-full glass-card p-8 space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <LogIn className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-gray-400">Sign in to manage your tasks</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <input
                            {...register('username')}
                            type="text"
                            className={`w-full input-field ${errors.username ? 'border-red-500/50' : ''}`}
                            placeholder="Enter your username"
                        />
                        {errors.username && (
                            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            className={`w-full input-field ${errors.password ? 'border-red-500/50' : ''}`}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
