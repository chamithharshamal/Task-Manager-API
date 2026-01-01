import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Send, MessageSquare } from 'lucide-react';
import type { Task, Comment } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { taskService } from '../api/taskService';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';

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
    const [commentText, setCommentText] = React.useState('');
    const queryClient = useQueryClient();

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

    const { data: comments = [] } = useQuery({
        queryKey: ['task-comments', initialData?.id],
        queryFn: () => taskService.getComments(initialData!.id),
        enabled: isOpen && !!initialData?.id,
    });

    // Real-time comments
    useWebSocket(
        initialData?.id ? `/topic/tasks/${initialData.id}/comments` : undefined,
        ['task-comments', initialData?.id]
    );

    const addCommentMutation = useMutation({
        mutationFn: (text: string) => taskService.addComment(initialData!.id, text),
        onSuccess: () => {
            setCommentText('');
            queryClient.invalidateQueries({ queryKey: ['task-comments', initialData?.id] });
        }
    });

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            addCommentMutation.mutate(commentText);
        }
    };

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
            <div className={`w-full ${initialData?.id ? 'max-w-4xl' : 'max-w-2xl'} glass-card p-6 scale-in max-h-[90vh] overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <div className={`grid grid-cols-1 ${initialData?.id ? 'lg:grid-cols-2 lg:gap-8' : ''}`}>
                        {/* Form Column */}
                        <form id="task-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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


                        </form>

                        {/* Comments Column */}
                        {initialData?.id && (
                            <div className="mt-8 lg:mt-0 flex flex-col h-full border-t lg:border-t-0 lg:border-l border-white/5 pt-8 lg:pt-0 lg:pl-8">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                                    Discussion
                                </h3>

                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px] pr-2 scrollbar-hide text-left">
                                    {comments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 text-sm italic">No comments yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        comments.map((comment: Comment) => (
                                            <div key={comment.id} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-emerald-400 text-sm">{comment.author.username}</span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 input-field"
                                    />
                                    <button
                                        type="submit"
                                        disabled={addCommentMutation.isPending || !commentText.trim()}
                                        className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                                    >
                                        {addCommentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-white/5 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="task-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};
