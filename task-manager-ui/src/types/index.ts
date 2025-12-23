export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
}

export interface User {
    id: number;
    username: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}
