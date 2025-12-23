import React from 'react';
import { Command } from 'cmdk';
import {
    Search,
    Plus,
    LogOut,
    LayoutGrid,
    Rows3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '../api/taskService';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';

export const CommandPalette = () => {
    const [open, setOpen] = React.useState(false);
    const logout = useAuthStore((state) => state.logout);

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: taskService.getTasks,
        enabled: open,
    });

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Palette"
            aria-describedby="cmdk-description"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <div className="w-full max-w-2xl bg-cyber-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden scale-in">
                <div className="flex items-center px-4 border-b border-white/5 bg-white/5">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <Command.Input
                        autoFocus
                        placeholder="Type a command or search tasks..."
                        className="w-full py-4 bg-transparent text-white text-lg outline-none placeholder:text-gray-600"
                    />
                </div>
                {/* Accessibility Description */}
                <div className="sr-only" id="cmdk-description">
                    Quick search for tasks and global application commands
                </div>

                <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
                    <Command.Empty className="p-8 text-center text-gray-500 text-sm">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="General" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2 mt-2">
                        <Item onSelect={() => runCommand(() => window.dispatchEvent(new CustomEvent('open-task-modal')))}>
                            <Plus className="w-4 h-4 mr-3" />
                            Create New Task
                            <kbd className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-500 font-sans border border-white/5">
                                <Plus className="w-2 h-2" /> N
                            </kbd>
                        </Item>
                        <Item onSelect={() => runCommand(() => logout())}>
                            <LogOut className="w-4 h-4 mr-3 text-red-500" />
                            Logout
                        </Item>
                    </Command.Group>

                    {tasks.length > 0 && (
                        <Command.Group heading="Tasks" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">
                            {tasks.map((task: any) => (
                                <Item key={task.id} onSelect={() => runCommand(() => window.dispatchEvent(new CustomEvent('edit-task', { detail: task })))}>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full mr-4",
                                        task.status === 'COMPLETED' ? "bg-emerald-500" : task.status === 'IN_PROGRESS' ? "bg-yellow-500" : "bg-gray-500"
                                    )} />
                                    <span className="truncate">{task.title}</span>
                                    <span className="ml-auto text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                        {task.priority || 'MEDIUM'}
                                    </span>
                                </Item>
                            ))}
                        </Command.Group>
                    )}

                    <Command.Group heading="Navigation" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2 mt-4">
                        <Item onSelect={() => runCommand(() => window.dispatchEvent(new CustomEvent('switch-view', { detail: 'table' })))}>
                            <Rows3 className="w-4 h-4 mr-3" />
                            Table View
                        </Item>
                        <Item onSelect={() => runCommand(() => window.dispatchEvent(new CustomEvent('switch-view', { detail: 'kanban' })))}>
                            <LayoutGrid className="w-4 h-4 mr-3" />
                            Kanban View
                        </Item>
                    </Command.Group>
                </Command.List>

                <div className="p-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[10px] text-gray-600">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/5">↵</kbd>
                            select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/5">↑↓</kbd>
                            navigate
                        </span>
                    </div>
                    <span>ESC to close</span>
                </div>
            </div>
        </Command.Dialog>
    );
};

const Item = ({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) => (
    <Command.Item
        onSelect={onSelect}
        className="flex items-center px-3 py-2.5 rounded-xl text-sm text-gray-300 aria-selected:bg-emerald-500 aria-selected:text-white cursor-pointer transition-all group"
    >
        {children}
    </Command.Item>
);
