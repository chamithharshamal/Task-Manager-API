<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.5.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MariaDB-10.4-003545?style=for-the-badge&logo=mariadb&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

# Synapse — Task Management System

> A full-stack, real-time collaborative task management platform built with **Spring Boot** and **React**, featuring Kanban boards, analytics dashboards, group collaboration, and a sleek **Cyber Emerald** dark theme.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Tasks](#tasks)
  - [Groups](#groups)
  - [Comments](#comments)
  - [Invitations](#invitations)
  - [Activity Logs](#activity-logs)
- [WebSocket Events](#websocket-events)
- [Project Structure](#project-structure)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Synapse** is a productivity engine designed for teams and individuals. It combines a robust Spring Boot REST API with a modern React SPA to deliver task management with real-time collaboration, drag-and-drop Kanban boards, team analytics, and email notifications — all wrapped in a custom dark theme with emerald accents.

---

## Features

### Task Management
- Full CRUD operations with rich text descriptions (Tiptap editor)
- **Kanban board** with drag-and-drop status changes (`@dnd-kit`)
- Table view and Kanban view toggle
- Task priorities (Low / Medium / High) and statuses (To Do / In Progress / Completed)
- Due date tracking with overdue highlighting
- Advanced filtering: by status, date range, month, "due this week", created today/this week
- Full-text search across title and description
- Server-side pagination and sorting

### Real-Time Collaboration
- **WebSocket** (STOMP over SockJS) for live task and comment updates
- Automatic React Query cache invalidation on WebSocket messages
- Live activity feed with auto-refresh

### Group & Team Features
- Create and manage work groups
- Invite members via email with accept/decline workflow
- Per-group task boards and filtering
- Role-based access: task owners can edit all fields; assigned members can only change status

### Analytics Dashboard
- Task status distribution **pie chart**
- Priority distribution **bar chart**
- 7-day completion trend **area chart**
- Key metrics: completion rate, team velocity, high-priority count, weekly output
- Filter analytics by group

### Authentication & Security
- JWT-based stateless authentication (HS512)
- Refresh token rotation with automatic silent renewal
- BCrypt password encoding
- Method-level security with `@PreAuthorize`
- Axios interceptors for transparent token management

### Productivity
- **Command Palette** (`Ctrl+K`) for quick task creation, navigation, and search
- Email notifications for group invitations and due-date reminders (hourly cron job)
- Activity logging for every task action (creation, status change, assignment, comments)

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Java 17 | Language runtime |
| Spring Boot 3.5.3 | Application framework |
| Spring Data JPA / Hibernate | ORM & database access |
| Spring Security | Authentication & authorization |
| Spring WebSocket (STOMP + SockJS) | Real-time messaging |
| Spring Mail | Email notifications |
| JJWT 0.11.5 | JWT token generation & validation |
| MariaDB | Relational database |
| Lombok | Boilerplate reduction |
| Jakarta Validation / Hibernate Validator | Request validation |
| Maven | Build tool |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI library |
| TypeScript 5.9 | Type safety |
| Vite 7 | Build tool & dev server |
| TailwindCSS 4 | Utility-first styling |
| TanStack React Query 5 | Server state management & caching |
| Zustand | Client-side auth state |
| React Router 6 | Client-side routing |
| `@dnd-kit` | Drag-and-drop (Kanban board) |
| Tiptap | Rich text editor |
| Recharts | Charts & data visualization |
| `cmdk` | Command palette (Ctrl+K) |
| Axios | HTTP client with interceptors |
| `@stomp/stompjs` + SockJS | WebSocket client |
| Framer Motion | Animations |
| Sonner | Toast notifications |
| React Hook Form + Zod | Form handling & schema validation |
| Lucide React | Icon library |
| date-fns | Date utilities |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                  │
│  React 19 · TypeScript · TailwindCSS · Vite         │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ React Query │  │ Zustand  │  │ STOMP/SockJS   │  │
│  │ (API Cache) │  │ (Auth)   │  │ (Real-time)    │  │
│  └──────┬──────┘  └────┬─────┘  └───────┬────────┘  │
└─────────┼──────────────┼────────────────┼────────── ┘
          │ REST (JSON)  │                │ WebSocket
          ▼              ▼                ▼
┌─────────────────────────────────────────────────────┐
│               Spring Boot Backend                   │
│  ┌────────────┐  ┌──────────┐  ┌────────────────┐   │
│  │ Controllers │ │ Security │  │ WebSocket      │   │
│  │  (REST API) │ │ (JWT)    │  │ (STOMP Broker) │   │
│  └──────┬──────┘ └──────────┘  └────────────────┘   │
│         ▼                                           │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Services  │  │  Repositories│  │ Spring Mail│ │ │
│  └──────┬─────┘  └──────┬───────┘  └──────────────┘ │
└─────────┼───────────────┼───────────────────────────┘
          ▼               ▼
┌─────────────────────────────────────────────────────┐
│                    MariaDB                          │
│  users · tasks · work_groups · comments             │
│  activity_logs · invitations · refresh_token        │
└─────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Java JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |
| MariaDB | 10.4+ (via XAMPP or standalone) |
| Git | Latest |

### Database Setup

1. **Using XAMPP** (recommended for local dev):
   - Install [XAMPP](https://www.apachefriends.org/)
   - Start **MySQL** and **Apache** from the XAMPP Control Panel
   - Verify MariaDB is running on port **3307** (edit `C:\xampp\mysql\bin\my.ini` if needed):
     ```ini
     [mysqld]
     port=3307

     [client]
     port=3307
     ```
   - Restart MySQL after changes

2. **Create the database**:
   - Open [phpMyAdmin](http://localhost/phpmyadmin)
   - Log in (`root` / no password by default)
   - Create a new database named **`task_manager_db`**

> **Tip:** If using a standalone MariaDB installation, just ensure it's accessible and create the database.

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/Task-Manager-API.git
cd Task-Manager-API

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at **http://localhost:8080**.

Verify with:
```bash
curl http://localhost:8080/check-db-connection
# Expected: Connected to: task_manager_db
```

### Frontend Setup

```bash
# Navigate to the frontend directory
cd task-manager-ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

The UI will be available at **http://localhost:5173**.

---

## Environment Variables

All values have sensible defaults for local development. Override them for production:

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:mariadb://localhost:3307/task_manager_db` | Database JDBC URL |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |
| `JWT_SECRET` | *(built-in dev key)* | **Change in production!** HS512 signing key |
| `JWT_EXPIRATION` | `3600000` (1 hour) | Access token TTL in ms |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP server host |
| `MAIL_PORT` | `587` | SMTP server port |
| `MAIL_USERNAME` | — | SMTP username (required for email features) |
| `MAIL_PASSWORD` | — | SMTP app password (required for email features) |

> **Security Note:** Never commit production secrets. Use environment variables or a `.env` file excluded from version control.

---

## API Reference

Base URL: `http://localhost:8080/api`

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login → returns access + refresh tokens | No |
| `POST` | `/auth/refresh-token` | Rotate refresh token | No |
| `POST` | `/auth/logout` | Logout | No |

**Register Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePass123",
  "roles": ["USER"]
}
```

**Login Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "tokenType": "Bearer"
}
```

### Tasks

All task endpoints require authentication (`Bearer <token>`).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks` | Get all tasks (owned + assigned) |
| `GET` | `/tasks/{id}` | Get task by ID |
| `PUT` | `/tasks/{id}` | Update task (owner: all fields; assigned: status only) |
| `DELETE` | `/tasks/{id}` | Delete task |
| `GET` | `/tasks/status/{status}` | Filter by status (`TO_DO`, `IN_PROGRESS`, `COMPLETED`) |
| `GET` | `/tasks/sorted/createdAt` | Tasks sorted by creation date (desc) |
| `GET` | `/tasks/search?query=` | Search by title or description |
| `GET` | `/tasks/due-this-week` | Tasks due within 7 days |
| `GET` | `/tasks/filter/today` | Tasks created today |
| `GET` | `/tasks/filter/this-week` | Tasks created this week |
| `GET` | `/tasks/filter/by-date?fromDate=&toDate=` | Filter by date range |
| `GET` | `/tasks/filter/by-month?month=&year=` | Filter by month |
| `GET` | `/tasks/paginated?page=&size=&sortBy=&sortDir=` | Paginated results |
| `GET` | `/tasks/group/{groupId}` | Tasks for a specific group |

### Groups

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/groups` | Create a new group |
| `GET` | `/groups/my-groups` | Get groups the user owns or belongs to |
| `GET` | `/groups/{id}` | Get group by ID |
| `POST` | `/groups/{id}/leave` | Leave a group (owners cannot leave) |
| `DELETE` | `/groups/{id}` | Delete group (cascades tasks + invitations) |

### Comments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tasks/{taskId}/comments` | Add a comment |
| `GET` | `/tasks/{taskId}/comments` | Get all comments for a task |

### Invitations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/invitations/invite` | Invite a user by email to a group |
| `POST` | `/invitations/{id}/accept` | Accept an invitation |
| `POST` | `/invitations/{id}/decline` | Decline an invitation |
| `GET` | `/invitations/my-pending` | Get current user's pending invitations |

### Activity Logs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/activities?page=&size=` | Paginated recent activities |
| `GET` | `/activities/task/{taskId}?page=&size=` | Activities for a specific task |

---

## WebSocket Events

Connect to `ws://localhost:8080/ws` using STOMP over SockJS.

| Topic | Trigger | Payload |
|---|---|---|
| `/topic/tasks` | Task created, updated, or deleted | Task object |
| `/topic/groups/{groupId}/tasks` | Group task changes | Task object |
| `/topic/tasks/{taskId}/comments` | New comment added | Comment object |

---

## Project Structure

```
Task-Manager-API/
├── pom.xml                                  # Maven build config
├── src/
│   ├── main/
│   │   ├── java/com/example/Task_Manager_api/
│   │   │   ├── TaskManagerApiApplication.java       # Entry point
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java              # JWT filter chain, CORS, CSRF
│   │   │   │   ├── WebConfig.java                   # CORS mappings
│   │   │   │   └── WebSocketConfig.java             # STOMP broker config
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java              # Register, login, refresh, logout
│   │   │   │   ├── TaskController.java              # Task CRUD + filters + pagination
│   │   │   │   ├── GroupController.java             # Group management
│   │   │   │   ├── CommentController.java           # Task comments
│   │   │   │   ├── InvitationController.java        # Email invitations
│   │   │   │   ├── ActivityLogController.java       # Activity feed
│   │   │   │   └── DatabaseCheckController.java     # Health check
│   │   │   ├── model/                               # JPA entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Task.java
│   │   │   │   ├── Group.java
│   │   │   │   ├── Comment.java
│   │   │   │   ├── ActivityLog.java
│   │   │   │   ├── Invitation.java
│   │   │   │   ├── RefreshToken.java
│   │   │   │   ├── TaskStatus.java                  # TO_DO, IN_PROGRESS, COMPLETED
│   │   │   │   └── TaskPriority.java                # LOW, MEDIUM, HIGH
│   │   │   ├── payload/                             # Request/response DTOs
│   │   │   ├── repository/                          # Spring Data JPA repositories
│   │   │   ├── security/                            # JWT filter, token provider, UserDetails
│   │   │   ├── service/                             # Business logic layer
│   │   │   └── exception/                           # Global exception handler
│   │   └── resources/
│   │       └── application.yml                      # App configuration
│   └── test/                                        # Unit & integration tests
│
└── task-manager-ui/                                 # React SPA
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx                                  # Root component & routing
        ├── main.tsx                                 # Entry point
        ├── api/
        │   ├── client.ts                            # Axios instance + interceptors
        │   ├── taskService.ts                       # Task API calls
        │   ├── activityService.ts                   # Activity API calls
        │   └── socketService.ts                     # STOMP WebSocket client
        ├── components/
        │   ├── AppLayout.tsx                        # Sidebar navigation layout
        │   ├── KanbanBoard.tsx                      # Drag-and-drop Kanban board
        │   ├── TaskModal.tsx                        # Create/edit task form + comments
        │   ├── ActivityPanel.tsx                    # Live activity timeline
        │   ├── CommandPalette.tsx                   # Ctrl+K command palette
        │   ├── ConfirmDialog.tsx                    # Reusable confirmation modal
        │   └── RichTextEditor.tsx                   # Tiptap rich text editor
        ├── pages/
        │   ├── LandingPage.tsx                      # Marketing / hero page
        │   ├── LoginPage.tsx                        # Login form
        │   ├── RegisterPage.tsx                     # Registration form
        │   ├── Dashboard.tsx                        # Main task management view
        │   ├── AnalyticsDashboard.tsx               # Charts & metrics
        │   └── GroupsPage.tsx                       # Team collaboration hub
        ├── hooks/
        │   └── useWebSocket.ts                      # WebSocket subscription hook
        ├── store/
        │   └── authStore.ts                         # Zustand auth state
        ├── types/
        │   └── index.ts                             # TypeScript interfaces
        └── utils/
            └── cn.ts                                # Class name utility (clsx + tailwind-merge)
```

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │    Group     │       │  Invitation  │
│──────────────│       │──────────────│       │──────────────│
│ id           │◄──┐   │ id           │──────►│ id           │
│ username     │   │   │ name         │       │ email        │
│ email        │   ├──►│ owner (FK)   │       │ status       │
│ password     │   │   │ members (M2M)│◄──┐   │ group (FK)   │
│ roles        │   │   └──────────────┘   │   └──────────────┘
└──────┬───────┘   │                      │
       │           │                      │
       │   ┌───────┴──────────────────────┘
       │   │
       ▼   ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Task      │       │   Comment    │       │ ActivityLog  │
│──────────────│       │──────────────│       │──────────────│
│ id           │──────►│ id           │       │ id           │
│ title        │       │ text         │       │ type         │
│ description  │       │ createdAt    │       │ description  │
│ status       │       │ author (FK)  │       │ timestamp    │
│ priority     │       │ task (FK)    │       │ user (FK)    │
│ dueDate      │       └──────────────┘       │ task (FK)    │
│ user (FK)    │                              └──────────────┘
│ group (FK)   │       ┌──────────────┐
│ assignedUser │       │ RefreshToken │
│ createdAt    │       │──────────────│
│ completedAt  │       │ id           │
└──────────────┘       │ token        │
                       │ expiryDate   │
                       │ user (FK)    │
                       └──────────────┘
```

---

## Screenshots

> *Add screenshots of your application here*
>
> Suggested screenshots:
> - Landing page
> - Dashboard (table view)
> - Kanban board
> - Analytics dashboard
> - Groups page
> - Command palette (Ctrl+K)
> - Task modal with comments

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code follows the existing style conventions and includes appropriate tests.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Weerasingha W.M.C.H.
