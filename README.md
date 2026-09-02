# TaskFlow - Backend API

Internal Task Management REST API built with Node.js, Express, and MySQL.

## Tech Stack
- **Runtime:** Node.js (Express.js)
- **Database:** MySQL (XAMPP local instance)
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Security:** In-memory rate limiting via `express-rate-limit`, strict RBAC middleware

## Setup & Installation

### 1. Environment Configuration
Copy `.env.example` to `.env` in the `server` directory and adjust if necessary:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=taskflow
JWT_SECRET=super_secret_jwt_key_12345
JWT_EXPIRES_IN=1d