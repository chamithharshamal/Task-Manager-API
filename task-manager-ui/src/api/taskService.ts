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

    createTask: async (task: Omit<Task, 'id' | 'createdAt'>) => {
        const response = await api.post<Task>('/tasks', task);
        return response.data;
    },

    updateTask: async (id: number, task: Partial<Task>) => {
        const response = await api.put<Task>(`/tasks/${id}`, task);
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
};
