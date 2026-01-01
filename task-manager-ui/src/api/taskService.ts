import api from './client';
import type { Task, TaskStatus, PaginatedResponse } from '../types';

export const taskService = {
    getTasks: async () => {
        const response = await api.get<Task[]>('/tasks');
        return response.data;
    },

    getTasksPaginated: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
        const response = await api.get<PaginatedResponse<Task>>('/tasks/paginated', {
            params: { page, size, sortBy, sortDir },
        });
        return response.data;
    },

    getTaskById: async (id: number) => {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    createTask: async (task: any) => {
        const payload = {
            ...task,
            group: task.groupId ? { id: parseInt(task.groupId) } : null,
            assignedUser: task.assignedUserId ? { id: parseInt(task.assignedUserId) } : null,
        };
        const response = await api.post<Task>('/tasks', payload);
        return response.data;
    },

    updateTask: async (id: number, task: any) => {
        const payload = {
            ...task,
            group: task.groupId ? { id: parseInt(task.groupId) } : undefined,
            assignedUser: task.assignedUserId ? { id: parseInt(task.assignedUserId) } : undefined,
        };
        const response = await api.put<Task>(`/tasks/${id}`, payload);
        return response.data;
    },

    deleteTask: async (id: number) => {
        await api.delete(`/tasks/${id}`);
    },

    getTasksByStatus: async (status: TaskStatus) => {
        const response = await api.get<Task[]>(`/tasks/status/${status}`);
        return response.data;
    },

    searchTasks: async (title: string) => {
        const response = await api.get<Task[]>('/tasks/search', {
            params: { title },
        });
        return response.data;
    },

    getTasksByGroup: async (groupId: number) => {
        const response = await api.get<Task[]>(`/tasks/group/${groupId}`);
        return response.data;
    },

    getComments: async (taskId: number) => {
        const response = await api.get<any[]>(`/tasks/${taskId}/comments`);
        return response.data;
    },

    addComment: async (taskId: number, text: string) => {
        const response = await api.post<any>(`/tasks/${taskId}/comments`, { text });
        return response.data;
    },
};
