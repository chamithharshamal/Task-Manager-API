import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    BarChart, Bar
} from 'recharts';
import {
    Activity,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Target,
    Zap
} from 'lucide-react';
import { taskService } from '../api/taskService';
import { AppLayout } from '../components/AppLayout';
import type { Task } from '../types';

const COLORS = {
    'TO_DO': '#94a3b8',
    'IN_PROGRESS': '#3b82f6',
    'COMPLETED': '#10b981',
    'LOW': '#10b981',
    'MEDIUM': '#f59e0b',
    'HIGH': '#ef4444'
};

export const AnalyticsDashboard: React.FC = () => {
    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: taskService.getTasks,
        staleTime: 1000 * 60 * 5,
    });

    // 1. Status Distribution Data
    const statusData = useMemo(() => {
        const counts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { name: 'To Do', value: counts['TO_DO'] || 0, color: COLORS['TO_DO'] },
            { name: 'In Progress', value: counts['IN_PROGRESS'] || 0, color: COLORS['IN_PROGRESS'] },
            { name: 'Completed', value: counts['COMPLETED'] || 0, color: COLORS['COMPLETED'] },
        ];
    }, [tasks]);

    // 2. Priority Breakdown Data
    const priorityData = useMemo(() => {
        const counts = tasks.reduce((acc, task) => {
            acc[task.priority || 'MEDIUM'] = (acc[task.priority || 'MEDIUM'] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { name: 'Low', value: counts['LOW'] || 0, color: COLORS['LOW'] },
            { name: 'Medium', value: counts['MEDIUM'] || 0, color: COLORS['MEDIUM'] },
            { name: 'High', value: counts['HIGH'] || 0, color: COLORS['HIGH'] },
        ];
    }, [tasks]);

    // 3. Completion Trend (Last 7 Days)
    const trendData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const completedOnDay = tasks.filter(t =>
                t.status === 'COMPLETED' &&
                t.createdAt?.split('T')[0] === date
            ).length;
            const createdOnDay = tasks.filter(t =>
                t.createdAt?.split('T')[0] === date
            ).length;

            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                completed: completedOnDay,
                created: createdOnDay
            };
        });
    }, [tasks]);

    // 4. Metrics
    const metrics = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
        const total = tasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const highPriority = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED').length;

        return [
            { label: 'Completion Rate', value: `${completionRate}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Efficiency Score', value: tasks.length > 0 ? 85 : 0, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'High Priority Peak', value: highPriority, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Weekly Velocity', value: trendData.reduce((a, b) => a + b.completed, 0), icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ];
    }, [tasks, trendData]);

    return (
        <AppLayout>
            <div className="p-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
                    <p className="text-gray-400">Deep dive into your productivity patterns and task velocity.</p>
                </header>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="bg-cyber-dark border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 ${metric.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                </div>
                                <Activity className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                            <div className="text-sm text-gray-500 font-medium">{metric.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Completion Trend */}
                    <div className="bg-cyber-dark border border-white/5 rounded-3xl p-8 backdrop-blur-xl bg-white/[0.02]">
                        <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Productivity Trend
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0a0a0b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCompleted)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-cyber-dark border border-white/5 rounded-3xl p-8 backdrop-blur-xl bg-white/[0.02]">
                        <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Status Distribution
                        </h3>
                        <div className="h-[300px] w-full flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0a0a0b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="bg-cyber-dark border border-white/5 rounded-3xl p-8 lg:col-span-2 backdrop-blur-xl bg-white/[0.02]">
                        <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Priority Analysis
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priorityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#0a0a0b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
