import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import type { Task } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

interface User {
    id: number;
    username: string;
}

interface Group {
    id: number;
    name: string;
    members: User[];
}

const taskSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['TO_DO', 'IN_PROGRESS', 'COMPLETED']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    dueDate: z.string().optional(),
    groupId: z.string().optional(),
    assignedUserId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
    initialData?: Task;
    title: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, initialData, title: modalTitle }) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: initialData ? {
            title: initialData.title,
            description: initialData.description,
            status: initialData.status,
            priority: initialData.priority,
            dueDate: initialData.dueDate,
            groupId: initialData.group?.id?.toString(),
            assignedUserId: initialData.assignedUser?.id?.toString(),
        } : {
            status: 'TO_DO',
            priority: 'MEDIUM',
        },
    });

    const currentUser = useAuthStore(state => state.user);
    const selectedGroupId = watch('groupId');

    // Is current user only the assigned user (and not owner)? 
    const isOwner = !initialData || initialData.user?.username === currentUser?.username;

    const { data: groups } = useQuery({
        queryKey: ['groups'],
        queryFn: async () => {
            const res = await api.get<Group[]>('/groups/my-groups');
            return res.data;
        },
        enabled: isOpen,
    });

    const selectedGroup = groups?.find(g => g.id.toString() === selectedGroupId);

    React.useEffect(() => {
        if (isOpen) {
            reset(initialData ? {
                title: initialData.title,
                description: initialData.description,
                status: initialData.status,
                priority: initialData.priority,
                dueDate: initialData.dueDate,
                groupId: initialData.group?.id?.toString(),
                assignedUserId: initialData.assignedUser?.id?.toString(),
            } : {
                title: '',
                description: '',
                status: 'TO_DO',
                priority: 'MEDIUM',
                dueDate: '',
                groupId: '',
                assignedUserId: '',
            });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const handleFormSubmit = async (data: TaskFormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl glass-card p-6 scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Task Title</label>
                        <input
                            {...register('title')}
                            disabled={!isOwner}
                            placeholder="What needs to be done?"
                            className={`w-full input-field ${errors.title ? 'border-red-500/50' : ''} ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className={!isOwner ? 'opacity-50 pointer-events-none' : ''}>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <RichTextEditor
                                    content={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Add some details..."
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Priority</label>
                            <select
                                {...register('priority')}
                                disabled={!isOwner}
                                className={`w-full input-field appearance-none bg-cyber-dark ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Due Date</label>
                            <input
                                {...register('dueDate')}
                                type="date"
                                disabled={!isOwner}
                                className={`w-full input-field bg-cyber-dark ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                            <select
                                {...register('status')}
                                className="w-full input-field appearance-none bg-cyber-dark"
                            >
                                <option value="TO_DO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Group (Optional)</label>
                            <select
                                {...register('groupId')}
                                disabled={!isOwner}
                                className="w-full input-field appearance-none bg-cyber-dark"
                            >
                                <option value="">No Group</option>
                                {groups?.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedGroupId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Assign To</label>
                            <select
                                {...register('assignedUserId')}
                                disabled={!isOwner}
                                className="w-full input-field appearance-none bg-cyber-dark"
                            >
                                <option value="">Unassigned</option>
                                {selectedGroup?.members.map(m => (
                                    <option key={m.id} value={m.id}>{m.username}</option>
                                ))}
                            </select>
                        </div>
                    )}


                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
