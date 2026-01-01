import React from 'react';
import {
    LayoutDashboard,
    BarChart3,
    LogOut,
    CheckCircle2,
    Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import { ConfirmDialog } from './ConfirmDialog';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false);

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
            active: location.pathname === '/dashboard'
        },
        {
            label: 'Analytics',
            icon: BarChart3,
            path: '/analytics',
            active: location.pathname === '/analytics'
        },
        {
            label: 'Groups',
            icon: Users,
            path: '/groups',
            active: location.pathname === '/groups'
        },
    ];

    const handleLogout = () => {
        setIsLogoutConfirmOpen(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-cyber-black">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-cyber-dark border-r border-white/5 flex flex-col z-[40]">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-emerald-500 font-bold text-xl uppercase tracking-widest cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        Tasker
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                                item.active
                                    ? "text-emerald-500 bg-emerald-500/10"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                {children}
            </main>

            <ConfirmDialog
                isOpen={isLogoutConfirmOpen}
                title="Sign Out?"
                message="Are you sure you want to sign out of Tasker?"
                variant="warning"
                confirmText="Sign Out"
                onConfirm={confirmLogout}
                onCancel={() => setIsLogoutConfirmOpen(false)}
            />
        </div>
    );
};
