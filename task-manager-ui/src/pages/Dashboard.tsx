import React from 'react';
import {
    LayoutDashboard,
    CheckCircle2,
    Clock,
    ListTodo,
    Plus,
    Search,
    LogOut,
    Calendar,
    Trash2,
    Edit,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import type { Task } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { taskService } from '../api/taskService';
import { TaskModal } from '../components/TaskModal';

export const Dashboard: React.FC = () => {
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Task | undefined>(undefined);

    // Fetch tasks
    const { data: tasks = [], isLoading, isError } = useQuery({
        queryKey: ['tasks'],
        queryFn: taskService.getTasks,
        staleTime: 1000 * 60 * 5,
    });

    React.useEffect(() => {
        if (isError) {
            toast.error('Failed to sync tasks with server');
        }
    }, [isError]);

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: (data: any) => editingTask
            ? taskService.updateTask(editingTask.id, data)
            : taskService.createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsModalOpen(false);
            setEditingTask(undefined);
            toast.success(editingTask ? 'Task updated' : 'Task created successfully');
        },
        onError: () => {
            toast.error('Failed to save task');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: taskService.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted');
        },
        onError: () => {
            toast.error('Failed to delete task');
        }
    });

    const handleCreateOrUpdate = async (data: any) => {
        saveMutation.mutate(data);
    };

    const handleDelete = async (id: number) => {
        toast.warning('Are you sure?', {
            description: 'This action cannot be undone.',
            action: {
                label: 'Delete',
                onClick: () => deleteMutation.mutate(id),
            },
            cancel: {
                label: 'Cancel',
                onClick: () => { },
            }
        });
    };

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'TO_DO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
    };

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-cyber-black">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-cyber-dark border-r border-white/5 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-emerald-500 font-bold text-xl uppercase tracking-widest">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        Tasker
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-emerald-500 bg-emerald-500/10 rounded-xl font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Calendar className="w-5 h-5" />
                        Schedule
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => {
                            logout();
                            window.location.href = '/login';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Workspace</h1>
                        <p className="text-gray-400 italic">Stay organized and productive today.</p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingTask(undefined);
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 group"
                    >
                        <Plus className="w-5 h-5 group-active:rotate-90 transition-transform" />
                        Add New Task
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="glass-card p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <ListTodo className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Tasks</p>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>
                    </div>
                    <div className="glass-card p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-white">{stats.todo}</p>
                        </div>
                    </div>
                    <div className="glass-card p-6 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Completed</p>
                            <p className="text-2xl font-bold text-white">{stats.completed}</p>
                        </div>
                    </div>
                    <div className="glass-card p-6 bg-gradient-to-br from-emerald-600/20 to-transparent border-emerald-500/20">
                        <p className="text-sm text-emerald-400 font-semibold mb-1">Productivity</p>
                        <p className="text-2xl font-black text-white">
                            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Task List Section */}
                <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-cyber-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Task</th>
                                    <th className="px-6 py-4 font-medium">Priority</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Due Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-3/4"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-20"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-1/2"></div></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    ))
                                ) : filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                            No tasks found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{task.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{task.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border ${task.priority === 'HIGH'
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : task.priority === 'MEDIUM'
                                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {task.priority || 'MEDIUM'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${task.status === 'COMPLETED'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : task.status === 'IN_PROGRESS'
                                                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {task.dueDate ? (
                                                    <span className={`flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-400' : ''}`}>
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 italic">No date</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingTask(task);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-emerald-500"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(task.id)}
                                                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <p className="text-sm text-gray-500 italic">Showing {filteredTasks.length} tasks</p>
                        <div className="flex gap-2">
                            <button disabled className="p-2 border border-white/5 rounded-lg text-gray-600 disabled:opacity-50">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button disabled className="p-2 border border-white/5 rounded-lg text-gray-600 disabled:opacity-50">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOrUpdate}
                initialData={editingTask}
                title={editingTask ? 'Edit Task' : 'Create New Task'}
            />
        </div>
    );
};
