import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import type { Task } from '../types';

const taskSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['TO_DO', 'IN_PROGRESS', 'COMPLETED']),
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
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: initialData ? {
            title: initialData.title,
            description: initialData.description,
            status: initialData.status,
        } : {
            status: 'TO_DO',
        },
    });

    React.useEffect(() => {
        if (isOpen) {
            reset(initialData ? {
                title: initialData.title,
                description: initialData.description,
                status: initialData.status,
            } : {
                title: '',
                description: '',
                status: 'TO_DO',
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
            <div className="w-full max-w-md glass-card p-6 scale-in">
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
                            placeholder="What needs to be done?"
                            className={`w-full input-field ${errors.title ? 'border-red-500/50' : ''}`}
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            placeholder="Add some details..."
                            className="w-full input-field resize-none"
                        />
                    </div>

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
