import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    CheckCircle2,
    Zap,
    Users,
    BarChart3,
    Shield,
    ArrowRight,
    Github,
    Twitter
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // If session exists, go straight to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-cyber-black text-gray-200 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full delay-700 animate-pulse" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-cyber-black/60 backdrop-blur-2xl border-b border-white/5 h-20">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 text-emerald-500 font-display font-black text-2xl tracking-tighter uppercase cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        Tasker
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-sm font-semibold text-gray-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">Features</a>
                        <a href="#security" className="text-sm font-semibold text-gray-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">Security</a>
                        <a href="#collaboration" className="text-sm font-semibold text-gray-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">Collaboration</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:block px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn-primary"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-20">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                        <Zap className="w-3 h-3" />
                        Next-Gen Productivity
                    </div>

                    <h1 className="text-6xl md:text-9xl font-display font-black tracking-tight leading-[0.85] uppercase">
                        MANAGE JOBS <br />
                        <span className="text-gradient">
                            CYBER PRECISION.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed font-medium px-4">
                        Tasker is a high-performance productivity engine designed for elite teams.
                        Streamline your workflow with real-time collaboration and deep analytics.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full sm:w-auto px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-lg font-black transition-all shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 group active:scale-95 uppercase tracking-tighter"
                        >
                            Start Building Now
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="btn-secondary w-full sm:w-auto px-12 py-5 text-lg uppercase tracking-tighter">
                            Watch Demo
                        </button>
                    </div>

                    {/* Preview Image / Mockup Placeholder */}
                    <div className="mt-28 relative px-4 max-w-5xl mx-auto">
                        <div className="aspect-video glass-card border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent z-10" />
                            <div className="absolute inset-0 flex items-center justify-center text-emerald-500/5">
                                <LayoutDashboardIcon className="w-80 h-80 transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            {/* Decorative dots */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-40 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-10">
                        <h2 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter">Engineered for Success</h2>
                        <p className="text-gray-500 max-w-xl mx-auto font-medium">Scale your operations with a feature set built for performance and reliability.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-12 space-y-8 group hover:-translate-y-2">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit border border-emerald-500/10 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all duration-500">
                                <Users className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-display font-black uppercase tracking-tight">Team Synergy</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    Form collaboration groups, invite members, and assign tasks with surgical precision.
                                </p>
                            </div>
                        </div>
                        <div className="glass-card p-12 space-y-8 group hover:-translate-y-2">
                            <div className="p-4 bg-blue-500/10 rounded-2xl w-fit border border-blue-500/10 group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-500">
                                <BarChart3 className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-display font-black uppercase tracking-tight">Deep Analytics</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    Visualize your productivity with real-time charts, velocity metrics, and priority breakdowns.
                                </p>
                            </div>
                        </div>
                        <div className="glass-card p-12 space-y-8 group hover:-translate-y-2">
                            <div className="p-4 bg-purple-500/10 rounded-2xl w-fit border border-purple-500/10 group-hover:scale-110 group-hover:border-purple-500/30 transition-all duration-500">
                                <Shield className="w-8 h-8 text-purple-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-display font-black uppercase tracking-tight">Data Sovereignty</h3>
                                <p className="text-gray-500 leading-relaxed font-medium">
                                    Your data is protected by industry-standard encryption and robust authentication protocols.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-40 relative bg-cyber-dark/30">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 space-y-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                                <Shield className="w-3 h-3" />
                                Ironclad Protection
                            </div>
                            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">
                                SECURE BY <br />
                                <span className="text-emerald-500">DEFAULT.</span>
                            </h2>
                        </div>
                        <p className="text-lg text-gray-400 leading-relaxed font-medium">
                            We take security seriously. Every transaction, every task, and every group interaction is guarded by enterprise-grade security layers.
                        </p>
                        <ul className="space-y-6">
                            {[
                                { title: 'JWT Authentication', desc: 'Secure session management with JSON Web Tokens.' },
                                { title: 'Encrypted Transmissions', desc: 'All data is sent over high-grade SSL/TLS layers.' },
                                { title: 'Role-Based Access', desc: 'Granular permissions ensure users only see what they own.' }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <div className="space-y-1">
                                        <div className="font-bold uppercase tracking-wider text-sm text-gray-200">{item.title}</div>
                                        <div className="text-gray-500 text-sm font-medium">{item.desc}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 w-full max-w-md aspect-square glass-card border-emerald-500/10 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-48 h-48 text-emerald-500/20 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 border-2 border-emerald-500/30 rounded-full animate-[ping_3s_linear_infinite]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Collaboration Section */}
            <section id="collaboration" className="py-40 relative">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-20">
                    <div className="flex-1 space-y-12 text-right md:text-left">
                        <div className="space-y-4 text-right">
                            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] justify-end w-full">
                                <Users className="w-3 h-3" />
                                Team Optimization
                            </div>
                            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none">
                                COLLABORATE <br />
                                <span className="text-emerald-500">WITHOUT LIMITS.</span>
                            </h2>
                        </div>
                        <p className="text-lg text-gray-400 leading-relaxed font-medium">
                            Tasker transforms individual effort into team success. Invite partners, manage permissions, and track group progress in one unified interface.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                            {[
                                { title: 'Seamless Invites', desc: 'Send email invitations to join your workspace.' },
                                { title: 'Group Tasks', desc: 'Assign work to specific members with ease.' },
                                { title: 'Real-time Status', desc: 'Watch your team move through tasks instantly.' },
                                { title: 'Centralized Hub', desc: 'All team resources in a single premium view.' }
                            ].map((item, i) => (
                                <div key={i} className="glass-card p-6 border-emerald-500/5 space-y-2">
                                    <div className="font-bold uppercase tracking-wider text-xs text-emerald-500">{item.title}</div>
                                    <div className="text-gray-500 text-xs font-medium leading-relaxed">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-md aspect-square glass-card border-emerald-500/10 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Users className="w-48 h-48 text-emerald-500/20 group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="w-40 h-40 border-2 border-emerald-500/20 rounded-2xl rotate-45 animate-[spin_10s_linear_infinite]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-32 pb-16 border-t border-white/5 bg-cyber-black">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-20">
                        <div className="space-y-8 max-w-sm">
                            <div className="flex items-center gap-3 text-emerald-500 font-display font-black text-3xl uppercase tracking-tighter">
                                <CheckCircle2 className="w-8 h-8" />
                                Tasker
                            </div>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Built for the next generation of creators. Focused on speed, security, and aesthetics. Step into the future of task management.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border border-white/5">
                                    <Github className="w-6 h-6" />
                                </a>
                                <a href="#" className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border border-white/5">
                                    <Twitter className="w-6 h-6" />
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 md:gap-24">
                            <div className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Product</h4>
                                <ul className="space-y-4 text-sm font-medium text-gray-500">
                                    <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                                    <li><a href="#analytics" className="hover:text-emerald-400 transition-colors">Analytics</a></li>
                                    <li><a href="#teams" className="hover:text-emerald-400 transition-colors">Teams</a></li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Company</h4>
                                <ul className="space-y-4 text-sm font-medium text-gray-500">
                                    <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
                                    <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-black uppercase tracking-[0.3em] text-gray-600">
                        <div>© 2025 Tasker Inc.</div>
                        <div className="flex items-center gap-6">
                            <span>Status: Online</span>
                            <span className="text-emerald-500/50">Version: 2.0.4-ELITE</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Internal Import for mockup visualization
const LayoutDashboardIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
);
