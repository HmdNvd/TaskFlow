# TaskFlow

TaskFlow is a full-stack task management application with JWT authentication, role-based access control, task assignment, dashboard statistics, and a Socket.IO messaging backend.

The repository contains two applications:

- `client/`: React and TypeScript frontend built with Vite.
- `server/`: Express REST API, MySQL persistence, authentication, and Socket.IO services.

## Features

- Email and password login with JWT sessions.
- Member/Admin Registration  
- Admin and member roles.
- Dashboard task statistics and recent-task views.
- Task creation, editing, assignment, due dates, status, and priority.
- Search and filtering by task status, priority, and assignee.
- Grid and table task views.
- Admin-only task deletion and user management.
- Authenticated one-to-one Socket.IO messaging backend with:
	- Message history.
	- Delivery and read receipts.
	- Delete-for-everyone and delete-for-me actions.
	- Typing indicators.
	- Multi-tab online presence tracking.

## Technology

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- React Hook Form and Zod
- Lucide React

### Backend

- Node.js
- Express
- MySQL with `mysql2`
- Socket.IO
- JWT with `jsonwebtoken`
- bcrypt password hashing
- CORS, Helmet, Morgan, and express-rate-limit

## Requirements

- Node.js and npm.
- MySQL. XAMPP can be used for a local MySQL instance.
- A MySQL database named `taskflow` with the tables required by the server:
	- `users`
	- `tasks`
	- `messages`
	- `message_user_deletions`

This repository currently does not include a schema or migration file. Create the database and tables using the schema supplied by your project environment before starting the server.

## Installation

Install dependencies independently for the frontend and backend.

```powershell
cd server
npm install

cd ..\client
npm install
```

## Environment Variables

### Server

Copy the example file and configure the database connection:

```powershell
cd server
Copy-Item .env.example .env
```

`server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=taskflow
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

Do not commit `server/.env` or use the example JWT secret in a shared or production environment.

### Client

Copy the client environment template:

```powershell
cd client
Copy-Item .env.example .env
```

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

The client uses the absolute API URL because Vite is not configured with a development proxy.

## Seed Demo Users

After MySQL is running and the required tables exist, seed the default accounts:

```powershell
cd server
node scripts/seed.js
```

The seed script creates or updates:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@taskflow.com` | `admin123` |
| Member | `member@taskflow.com` | `member123` |

The Socket.IO verification script assumes these users are available as user IDs `1` and `2`.

## Run Locally

Start the API in one terminal:

```powershell
cd server
npm run dev
```

The server listens on `http://localhost:5000`.

Start the frontend in a second terminal:

```powershell
cd client
npm run dev
```

Vite prints the local frontend URL, normally `http://localhost:5173`.

For a production-style frontend preview:

```powershell
cd client
npm run build
npm run preview
```

## REST API

The API base URL is `http://localhost:5000/api`. Login and registration return JWT-based session data; protected requests require the token expected by the existing client service.

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/health` | Public; checks database connectivity |
| POST | `/auth/login` | Public |
| POST | `/auth/register` | Public; creates a member |
| GET | `/auth/me` | Authenticated |
| GET | `/tasks/stats` | Authenticated |
| GET | `/tasks` | Authenticated |
| GET | `/tasks/:id` | Authenticated |
| POST | `/tasks` | Authenticated |
| PATCH | `/tasks/:id` | Authenticated |
| PUT | `/tasks/:id` | Authenticated |
| DELETE | `/tasks/:id` | Admin only |
| GET | `/users` | Authenticated |
| GET | `/users/:id` | Authenticated |
| POST | `/users` | Admin only |
| DELETE | `/users/:id` | Admin only |

### Role behavior

- Admins can manage tasks, assign work, delete tasks, and create or delete users.
- Members can view tasks available to them, create tasks without assigning them to another user, and update task status.
- Task access is scoped by the authenticated user and task ownership/assignment rules in the server controllers.

## Socket.IO

The Socket.IO server runs at `http://localhost:5000` and authenticates connections with a JWT:

```js
io('http://localhost:5000', {
	auth: { token: `Bearer ${jwt}` }
})
```

Client events include `chat:join`, `message:send`, `message:delivered`, `message:read`, `message:delete_everyone`, `message:delete_me`, `typing:start`, and `typing:stop`.

Server events include `chat:history`, `message:receive`, `message:delivered_receipt`, `message:read_receipt`, `message:deleted_everyone`, `message:deleted_me`, `typing:start`, `typing:stop`, `user:status`, and `error`.

Run the comprehensive socket verification with MySQL running, the API started, and the demo users seeded:

```powershell
cd server
npm run test:socket
```

The test covers authentication, presence, chat history, encrypted message payloads, delivery/read receipts, deletion behavior, and multi-tab presence teardown.

## Health Check

Once the server is running, request:

```text
GET http://localhost:5000/api/health
```

A healthy response confirms that the API can reach MySQL.

## Troubleshooting

### Socket test times out

Make sure MySQL is running, the `taskflow` database and required tables exist, the demo users have been seeded, and the API is listening on port `5000`. The socket workflow performs database queries during connection and message events, so a stopped database can look like a Socket.IO timeout.

### Authentication fails

Check that `JWT_SECRET` is present in `server/.env` and is the same secret used by the running server and any generated test token.

### Frontend cannot reach the API

Verify that the backend is running and that `client/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing environment variables.

## Project Structure

```text
TaskFlow/
├── client/                 # React/Vite frontend
│   └── src/
│       ├── components/     # Shared UI and task components
│       ├── context/        # Authentication context
│       ├── pages/          # Auth, dashboard, task, and user pages
│       ├── routes/         # Protected and guest routes
│       └── services/       # API, auth, session, and task clients
└── server/                 # Express/MySQL/Socket.IO backend
		├── controllers/        # Request handlers
		├── middleware/         # Auth, roles, and error handling
		├── routes/             # REST route definitions
		├── sockets/            # Socket.IO handlers
		└── scripts/            # Database seed scripts
```

## Available Scripts

### Client

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the frontend |
| `npm run preview` | Preview the production build |

### Server

| Command | Description |
| --- | --- |
| `npm start` | Start the API with Node.js |
| `npm run dev` | Start the API with nodemon |
| `npm run test:socket` | Run the Socket.IO verification script |