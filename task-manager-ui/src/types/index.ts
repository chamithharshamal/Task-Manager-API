export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Group {
    id: number;
    name: string;
    owner: User;
    members: User[];
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    user: User; // Owner
    group?: Group;
    assignedUser?: User;
}

export interface User {
    id: number;
    username: string;
    email?: string;
    roles?: string[];
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

export interface Invitation {
    id: number;
    email: string;
    group: Group;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    invitedAt: string;
}
