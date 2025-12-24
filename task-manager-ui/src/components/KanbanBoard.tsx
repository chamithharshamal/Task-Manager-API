import React from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskStatus } from '../types';
import { cn } from '../utils/cn';
import { Edit, Trash2, Clock, CheckCircle2, ListTodo } from 'lucide-react';

interface KanbanBoardProps {
    tasks: Task[];
    onUpdateStatus: (taskId: number, status: TaskStatus) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
}

const COLUMNS: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
    { id: 'TO_DO', title: 'To Do', icon: <ListTodo className="w-5 h-5" />, color: 'text-gray-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400' },
    { id: 'COMPLETED', title: 'Completed', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onUpdateStatus, onEdit, onDelete }) => {
    const [activeId, setActiveId] = React.useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const taskId = active.id as number;
        const overId = over.id.toString();

        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        let newStatus: TaskStatus | null = null;

        // Dropped directly over a column
        if (['TO_DO', 'IN_PROGRESS', 'COMPLETED'].includes(overId)) {
            newStatus = overId as TaskStatus;
        }
        // Dropped over another task
        else {
            const overTask = tasks.find(t => t.id === parseInt(overId));
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus && newStatus !== task.status) {
            onUpdateStatus(taskId, newStatus);
        }
    };

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
                {COLUMNS.map(column => (
                    <SortableColumn
                        key={column.id}
                        column={column}
                        tasks={tasks.filter(t => t.status === column.id)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeTask ? (
                    <div className="glass-card p-4 border-emerald-500/50 rotate-3 shadow-2xl w-[300px]">
                        <h4 className="font-bold text-white mb-1">{activeTask.title}</h4>
                        <div
                            className="text-xs text-gray-400 line-clamp-2 prose prose-invert prose-xs"
                            dangerouslySetInnerHTML={{ __html: activeTask.description || '' }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

interface SortableColumnProps {
    column: { id: TaskStatus; title: string; icon: React.ReactNode; color: string };
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
}

const SortableColumn: React.FC<SortableColumnProps> = ({ column, tasks, onEdit, onDelete }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full bg-cyber-dark/30 rounded-2xl border border-white/5 p-4 min-h-[500px]"
        >
            <div className={cn("flex items-center gap-2 mb-4 font-bold uppercase tracking-wider text-sm", column.color)}>
                {column.icon}
                {column.title}
                <span className="ml-auto bg-white/5 px-2 py-0.5 rounded text-xs">{tasks.length}</span>
            </div>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-3">
                    {tasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="h-full min-h-[100px] border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-600 text-sm italic">
                            Empty
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

const SortableTaskCard: React.FC<{
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
}> = ({ task, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="glass-card p-4 group cursor-grab active:cursor-grabbing hover:border-emerald-500/30 transition-all"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase border",
                    task.priority === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        task.priority === 'MEDIUM' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                )}>
                    {task.priority || 'MEDIUM'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onPointerDown={e => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-emerald-500"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onPointerDown={e => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-red-500"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{task.title}</h4>
            <div
                className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed prose prose-invert prose-xs"
                dangerouslySetInnerHTML={{ __html: task.description || '' }}
            />
            {task.dueDate && (
                <div className={cn("flex items-center gap-1.5 text-[10px] font-medium",
                    new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-400' : 'text-gray-500'
                )}>
                    <Clock className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};
