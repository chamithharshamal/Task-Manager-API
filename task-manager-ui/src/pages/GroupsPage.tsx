import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Mail, Plus, Check, X, Loader2, Send, ListTodo, Edit, LogOut, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Group, Invitation, Task } from '../types';
import { taskService } from '../api/taskService';
import { TaskModal } from '../components/TaskModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useWebSocket } from '../hooks/useWebSocket';

export const GroupsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const currentUser = useAuthStore((state) => state.user);
    const [newGroupName, setNewGroupName] = React.useState('');
    const [inviteEmails, setInviteEmails] = React.useState<{ [groupId: number]: string }>({});
    const [selectedGroupId, setSelectedGroupId] = React.useState<number | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Task | undefined>(undefined);
    const [taskSearch, setTaskSearch] = React.useState('');

    // Subscribe to group task updates
    useWebSocket(
        selectedGroupId ? `/topic/groups/${selectedGroupId}/tasks` : undefined,
        ['group-tasks', selectedGroupId]
    );

    const [confirmConfig, setConfirmConfig] = React.useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'info';
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    const { data: groups, isLoading: groupsLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            const res = await api.get<Group[]>('/groups/my-groups');
            return res.data;
        },
    });

    const { data: invitations, isLoading: invitesLoading } = useQuery({
        queryKey: ['pending-invitations'],
        queryFn: async () => {
            const res = await api.get<Invitation[]>('/invitations/my-pending');
            return res.data;
        },
    });

    const { data: tasks, isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => taskService.getTasks(),
    });

    const createGroupMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await api.post('/groups', name);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setNewGroupName('');
            toast.success('Group created successfully');
        },
        onError: () => toast.error('Failed to create group'),
    });

    const inviteMutation = useMutation({
        mutationFn: async ({ groupId, email }: { groupId: number; email: string }) => {
            const res = await api.post('/invitations/invite', { groupId, email });
            return res.data;
        },
        onSuccess: (_, variables) => {
            setInviteEmails(prev => ({ ...prev, [variables.groupId]: '' }));
            toast.success(`Invitation sent to ${variables.email}`);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send invitation'),
    });

    const acceptMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/invitations/${id}/accept`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Joined group successfully');
        },
        onError: () => toast.error('Failed to accept invitation'),
    });

    const declineMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/invitations/${id}/decline`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
            toast.info('Invitation declined');
        },
    });

    const leaveGroupMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/groups/${id}/leave`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            if (selectedGroupId) setSelectedGroupId(null);
            toast.success('You have left the group');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to leave group'),
    });

    const deleteGroupMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/groups/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            if (selectedGroupId) setSelectedGroupId(null);
            toast.success('Group deleted');
        },
        onError: () => toast.error('Failed to delete group'),
    });

    const saveTaskMutation = useMutation({
        mutationFn: (data: any) => editingTask
            ? taskService.updateTask(editingTask.id, data)
            : taskService.createTask({ ...data, groupId: selectedGroupId?.toString() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsTaskModalOpen(false);
            setEditingTask(undefined);
            toast.success(editingTask ? 'Task updated' : 'Task created');
        },
        onError: () => toast.error('Failed to save task'),
    });

    if (groupsLoading || invitesLoading || tasksLoading) {
        return (
            <div className="min-h-screen bg-cyber-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    const selectedGroup = groups?.find(g => g.id === selectedGroupId);
    const groupTasks = tasks?.filter((t: Task) => t.group?.id === selectedGroupId) || [];

    return (
        <div className="min-h-screen bg-cyber-black text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Collaboration Groups</h1>
                        <p className="text-gray-400 mt-2">Manage your teams and shared projects.</p>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group name..."
                            className="input-field max-w-xs"
                        />
                        <button
                            onClick={() => createGroupMutation.mutate(newGroupName)}
                            disabled={!newGroupName || createGroupMutation.isPending}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Group
                        </button>
                    </div>
                </div>

                {invitations && invitations.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold flex items-center gap-2 text-emerald-500">
                            <Mail className="w-6 h-6" />
                            Invitations ({invitations.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {invitations.map((inv) => (
                                <div key={inv.id} className="glass-card p-6 flex items-center justify-between border-emerald-500/30">
                                    <div>
                                        <p className="font-semibold">{inv.group.name}</p>
                                        <p className="text-xs text-gray-500">From: {inv.group.owner.username}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => acceptMutation.mutate(inv.id)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20">
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => declineMutation.mutate(inv.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groups?.map((group) => {
                        const currentGroupTasks = tasks?.filter((t: Task) => t.group?.id === group.id) || [];
                        const completedCount = currentGroupTasks.filter((t: Task) => t.status === 'COMPLETED').length;
                        const progress = currentGroupTasks.length > 0 ? Math.round((completedCount / currentGroupTasks.length) * 100) : 0;

                        return (
                            <div key={group.id} className={`glass-card p-6 flex flex-col group transition-all ${selectedGroupId === group.id ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'hover:border-emerald-500/30'}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {group.owner.username === currentUser?.username ? (
                                            <button onClick={() => setConfirmConfig({
                                                isOpen: true,
                                                title: 'Delete Group',
                                                message: 'Permanently delete this group and all its tasks?',
                                                variant: 'danger',
                                                onConfirm: () => deleteGroupMutation.mutate(group.id)
                                            })} className="p-2 text-gray-500 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button onClick={() => setConfirmConfig({
                                                isOpen: true,
                                                title: 'Leave Group',
                                                message: 'Are you sure you want to leave this group?',
                                                variant: 'warning',
                                                onConfirm: () => leaveGroupMutation.mutate(group.id)
                                            })} className="p-2 text-gray-500 hover:text-orange-500">
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-1">{group.name}</h3>
                                <p className="text-xs text-gray-500 mb-6 italic">{group.owner.username}'s Team</p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-gray-500">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex -space-x-2">
                                        {group.members.slice(0, 3).map((m: any) => (
                                            <div key={m.id} className="w-8 h-8 rounded-full bg-cyber-black border border-white/10 flex items-center justify-center text-[10px] font-bold" title={m.username}>
                                                {m.username.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${selectedGroupId === group.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500 hover:bg-emerald-500/10'}`}
                                    >
                                        {selectedGroupId === group.id ? 'Close' : 'View Tasks'}
                                    </button>
                                </div>

                                {group.owner.username === currentUser?.username && (
                                    <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                                        <input
                                            type="email"
                                            value={inviteEmails[group.id] || ''}
                                            onChange={(e) => setInviteEmails({ ...inviteEmails, [group.id]: e.target.value })}
                                            placeholder="Invite email..."
                                            className="input-field text-xs py-2"
                                        />
                                        <button
                                            onClick={() => inviteMutation.mutate({ groupId: group.id, email: inviteEmails[group.id] })}
                                            disabled={!inviteEmails[group.id] || inviteMutation.isPending}
                                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>

                {selectedGroupId && (
                    <section className="glass-card overflow-hidden animate-in slide-in-from-bottom duration-500">
                        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <ListTodo className="w-6 h-6 text-emerald-500" />
                                <h2 className="text-2xl font-bold">{selectedGroup?.name} Tasks</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={taskSearch}
                                        onChange={(e) => setTaskSearch(e.target.value)}
                                        placeholder="Search tasks..."
                                        className="input-field pl-10 py-2 ml-2 text-sm max-w-[200px]"
                                    />
                                </div>
                                <button
                                    onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}
                                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Task
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Task</th>
                                        <th className="px-6 py-4">Assignee</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {groupTasks
                                        .filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()))
                                        .map((task) => (
                                            <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm">{task.title}</div>
                                                    <div className="text-[10px] text-gray-500">{task.priority} Priority</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {task.assignedUser ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                                                                {task.assignedUser.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-xs text-gray-300">{task.assignedUser.username}</span>
                                                        </div>
                                                    ) : <span className="text-xs text-gray-600 italic">Unassigned</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }} className="p-1 hover:text-emerald-500">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    {groupTasks.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic text-sm">No tasks in this group.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>

            <ConfirmDialog
                {...confirmConfig}
                onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
            />

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={async (data) => saveTaskMutation.mutate(data)}
                initialData={editingTask}
                title={editingTask ? 'Edit Task' : 'Add Task'}
            />
        </div>
    );
};
