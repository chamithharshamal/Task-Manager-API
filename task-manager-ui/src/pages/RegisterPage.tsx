import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z.string().min(4, 'Confirm password must be at least 4 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError(null);
        try {
            // Mapping to the backend User model (roles defaults to empty set or handled by backend)
            await api.post('/auth/register', {
                username: data.username,
                password: data.password,
                roles: ['USER'] // Default role
            });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data || 'Registration failed. Please try again.');
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
                            <UserPlus className="w-8 h-8 text-emerald-500" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
                    <p className="mt-2 text-gray-400">Join Tasker and stay organized</p>
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
                            placeholder="Choose a username"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            className={`w-full input-field ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
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
                            'Register Now'
                        )}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-500 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Already have an account? Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
