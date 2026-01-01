import api from './client';
import type { ActivityLog, PaginatedResponse } from '../types';

export const activityService = {
    getRecentActivities: async (page = 0, size = 10) => {
        const response = await api.get<PaginatedResponse<ActivityLog>>('/activities', {
            params: { page, size },
        });
        return response.data;
    },

    getTaskActivities: async (taskId: number, page = 0, size = 10) => {
        const response = await api.get<PaginatedResponse<ActivityLog>>(`/activities/task/${taskId}`, {
            params: { page, size },
        });
        return response.data;
    },
};
