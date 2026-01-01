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

    const { data: groupTasks, isLoading: tasksLoading } = useQuery({
        queryKey: ['group-tasks', selectedGroupId],
        queryFn: () => selectedGroupId ? taskService.getTasksByGroup(selectedGroupId) : Promise.resolve([]),
        enabled: !!selectedGroupId,
    });

    const createGroupMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await api.post('/groups', name);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setNewGroupName('');
            setConfirmConfig({
                isOpen: true,
                title: 'Success!',
                message: 'Your new group has been created successfully.',
                variant: 'info',
                confirmText: 'Great',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: () => {
            setConfirmConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to create group. Please check the name and try again.',
                variant: 'danger',
                confirmText: 'Try Again',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
    });

    const inviteMutation = useMutation({
        mutationFn: async ({ groupId, email }: { groupId: number; email: string }) => {
            const res = await api.post('/invitations/invite', { groupId, email });
            return res.data;
        },
        onSuccess: (_, variables) => {
            setInviteEmails(prev => ({ ...prev, [variables.groupId]: '' }));
            setConfirmConfig({
                isOpen: true,
                title: 'Invitation Sent',
                message: `An invitation email has been sent to ${variables.email}.`,
                variant: 'info',
                confirmText: 'Close',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: (err: any) => {
            setConfirmConfig({
                isOpen: true,
                title: 'Invitation Failed',
                message: err.response?.data?.message || 'Failed to send invitation. Make sure the email is registered.',
                variant: 'danger',
                confirmText: 'Close',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
    });

    const acceptMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/invitations/${id}/accept`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            setConfirmConfig({
                isOpen: true,
                title: 'Welcome!',
                message: 'You have successfully joined the group.',
                variant: 'info',
                confirmText: 'Start Working',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: () => {
            setConfirmConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to accept invitation. It might have been revoked or you are already a member.',
                variant: 'danger',
                confirmText: 'Close',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
    });

    const declineMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/invitations/${id}/decline`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
            setConfirmConfig({
                isOpen: true,
                title: 'Invitation Declined',
                message: 'You have declined the group invitation.',
                variant: 'info',
                confirmText: 'Understood',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: () => {
            setConfirmConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to decline invitation. Please try again later.',
                variant: 'danger',
                confirmText: 'Close',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
    });

    const leaveGroupMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/groups/${id}/leave`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            if (selectedGroupId) setSelectedGroupId(null);
            setConfirmConfig({
                isOpen: true,
                title: 'Membership Updated',
                message: 'You have successfully left the group.',
                variant: 'info',
                confirmText: 'Done',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: (err: any) => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            toast.error(err.response?.data?.message || 'Failed to leave group');
        },
    });

    const deleteGroupMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/groups/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            if (selectedGroupId) setSelectedGroupId(null);
            setConfirmConfig({
                isOpen: true,
                title: 'Group Deleted',
                message: 'The group and all associated data have been permanently removed.',
                variant: 'info',
                confirmText: 'Acknowledge',
                cancelText: 'NONE',
                onConfirm: () => setConfirmConfig(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: () => {
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            toast.error('Failed to delete group');
        },
    });

    const saveTaskMutation = useMutation({
        mutationFn: (data: any) => editingTask
            ? taskService.updateTask(editingTask.id, data)
            : taskService.createTask({ ...data, groupId: selectedGroupId?.toString() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-tasks', selectedGroupId] });
            setIsTaskModalOpen(false);
            setEditingTask(undefined);
            toast.success(editingTask ? 'Task updated' : 'Task created successfully');
        },
        onError: () => toast.error('Failed to save task'),
    });

    if (groupsLoading || invitesLoading) {
        return (
            <div className="min-h-screen bg-cyber-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    const selectedGroup = groups?.find(g => g.id === selectedGroupId);

    return (
        <div className="min-h-screen bg-cyber-black text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header & Create Group */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Collaboration Groups</h1>
                        <p className="text-gray-400 mt-2">Create groups and invite members to work together.</p>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="New group name..."
                            className="input-field max-w-xs"
                        />
                        <button
                            onClick={() => createGroupMutation.mutate(newGroupName)}
                            disabled={!newGroupName || createGroupMutation.isPending}
                            className="btn-primary flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Create Group
                        </button>
                    </div>
                </div>

                {/* Pending Invitations */}
                {invitations && invitations.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <Mail className="w-6 h-6 text-emerald-500" />
                            Pending Invitations ({invitations.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {invitations.map((inv) => (
                                <div key={inv.id} className="glass-card p-6 flex items-center justify-between border-emerald-500/30">
                                    <div>
                                        <p className="font-semibold text-lg">{inv.group.name}</p>
                                        <p className="text-sm text-gray-400">Invited by: {inv.group.owner.username}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptMutation.mutate(inv.id)}
                                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors border border-emerald-500/20"
                                            title="Accept"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => declineMutation.mutate(inv.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
                                            title="Decline"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* My Groups */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-500" />
                        My Groups
                    </h2>

                    {groups && groups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    className={`glass-card overflow-hidden transition-all ${selectedGroupId === group.id ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20' : ''}`}
                                >
                                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold">{group.name}</h3>
                                            <p className="text-sm text-gray-400">Owner: {group.owner.username}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedGroupId === group.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                            >
                                                {selectedGroupId === group.id ? 'Viewing Tasks' : 'View Tasks'}
                                            </button>
                                            <div className="flex -space-x-2">
                                                {group.members.slice(0, 3).map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-cyber-black text-xs font-bold"
                                                        title={m.username}
                                                    >
                                                        {m.username.charAt(0).toUpperCase()}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-300">Members ({group.members.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {group.members.map(m => (
                                                    <span key={m.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                                                        {m.username}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            {group.owner.username === currentUser?.username ? (
                                                <>
                                                    <div className="flex gap-2 flex-grow mr-4">
                                                        <input
                                                            type="email"
                                                            value={inviteEmails[group.id] || ''}
                                                            onChange={(e) => setInviteEmails(prev => ({ ...prev, [group.id]: e.target.value }))}
                                                            placeholder="Member email..."
                                                            className="input-field text-sm"
                                                        />
                                                        <button
                                                            onClick={() => inviteMutation.mutate({ groupId: group.id, email: inviteEmails[group.id] })}
                                                            disabled={!inviteEmails[group.id] || inviteMutation.isPending}
                                                            className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            Invite
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmConfig({
                                                                isOpen: true,
                                                                title: 'Delete Group?',
                                                                message: 'Are you sure you want to delete this group? All tasks, memberships, and invitations will be permanently removed.',
                                                                variant: 'danger',
                                                                onConfirm: () => deleteGroupMutation.mutate(group.id)
                                                            });
                                                        }}
                                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                                        title="Delete Group"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setConfirmConfig({
                                                            isOpen: true,
                                                            title: 'Leave Group?',
                                                            message: 'Are you sure you want to leave this group? You will lose access to all tasks and group members.',
                                                            variant: 'warning',
                                                            onConfirm: () => leaveGroupMutation.mutate(group.id)
                                                        });
                                                    }}
                                                    className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-2 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Leave Group
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 glass-card">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-300">No groups yet</h3>
                            <p className="text-gray-500">Create a group to start collaborating.</p>
                        </div>
                    )}
                </section>

                {/* Group Tasks Section */}
                {selectedGroupId && (
                    <section className="space-y-6 animate-in slide-in-from-bottom duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <ListTodo className="w-6 h-6 text-emerald-500" />
                                Tasks for {selectedGroup?.name}
                            </h2>
                            {selectedGroup?.owner.username === currentUser?.username && (
                                <button
                                    onClick={() => {
                                        setEditingTask(undefined);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Group Task
                                </button>
                            )}
                        </div>

                        {/* Task Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={taskSearch}
                                onChange={(e) => setTaskSearch(e.target.value)}
                                placeholder="Search group tasks..."
                                className="input-field w-full max-w-md"
                                style={{ paddingLeft: '3.5rem' }}
                            />
                        </div>

                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                                            <th className="px-6 py-4 font-medium">Task</th>
                                            <th className="px-6 py-4 font-medium">Assigned To</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {tasksLoading ? (
                                            <tr><td colSpan={4} className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" /></td></tr>
                                        ) : groupTasks && groupTasks.length > 0 ? (
                                            groupTasks
                                                .filter(t =>
                                                    (t.user?.username === currentUser?.username || t.assignedUser?.username === currentUser?.username) &&
                                                    (t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                                                        t.assignedUser?.username.toLowerCase().includes(taskSearch.toLowerCase()))
                                                )
                                                .map((task) => (
                                                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-white">{task.title}</div>
                                                            <div className="text-xs text-gray-500">{task.priority} Priority</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {task.assignedUser ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-500 font-bold">
                                                                        {task.assignedUser.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-sm">{task.assignedUser.username}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-600 italic">Unassigned</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {(task.user?.username === currentUser?.username || task.assignedUser?.username === currentUser?.username) && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingTask(task);
                                                                        setIsTaskModalOpen(true);
                                                                    }}
                                                                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-emerald-500"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">No tasks found for this group.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <ConfirmDialog
                {...confirmConfig}
                isLoading={deleteGroupMutation.isPending || leaveGroupMutation.isPending}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={async (data) => {
                    await saveTaskMutation.mutateAsync(data);
                }}
                initialData={editingTask}
                title={editingTask ? 'Edit Group Task' : 'Add Group Task'}
            />
        </div >
    );
};
