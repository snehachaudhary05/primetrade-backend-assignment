# PrimeTrade — Scalable REST API with Authentication & RBAC

A production-ready REST API built with Node.js, Express, and MongoDB Atlas featuring JWT authentication, Role-Based Access Control (RBAC), full CRUD operations, Swagger documentation, and a React frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (jsonwebtoken) + bcryptjs (12 rounds) |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| API Docs | Swagger / OpenAPI 3.0 |
| Frontend | React 18 + Vite + React Router |

---

## Project Structure

```
primetrade-backend/
├── backend/
│   ├── server.js                  # Entry point — connects MongoDB then starts server
│   ├── .env                       # Environment variables (not committed)
│   ├── .env.example               # Environment variable template
│   └── src/
│       ├── app.js                 # Express app — middleware, routes, error handling
│       ├── config/
│       │   ├── db.js              # Mongoose connection
│       │   └── swagger.js         # Swagger / OpenAPI 3.0 setup
│       ├── models/
│       │   ├── User.js            # User schema (name, email, password, role, is_active)
│       │   └── Task.js            # Task schema (title, description, status, priority, due_date, user_id)
│       ├── middleware/
│       │   ├── auth.js            # JWT authentication guard
│       │   ├── roleCheck.js       # Role-based authorization (authorize('admin'))
│       │   ├── validate.js        # express-validator error formatter
│       │   ├── errorHandler.js    # Global error handler
│       │   └── notFound.js        # 404 handler
│       └── modules/
│           ├── auth/              # Register, Login, Get Profile
│           ├── tasks/             # Full CRUD (Create, Read, Update, Delete)
│           └── admin/             # User management + platform stats (admin only)
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.jsx                # Routes setup
│       ├── api/client.js          # Fetch wrapper with JWT headers + auto-logout on 401
│       ├── context/
│       │   ├── AuthContext.jsx    # User/token state management
│       │   └── ToastContext.jsx   # Toast notifications
│       ├── components/
│       │   ├── Navbar.jsx         # Top navigation with user info and logout
│       │   ├── ProtectedRoute.jsx # Redirects unauthenticated users to /login
│       │   └── TaskModal.jsx      # Create / Edit task modal
│       └── pages/
│           ├── Login.jsx          # Login form
│           ├── Register.jsx       # Register form with role selector (user / admin)
│           ├── Dashboard.jsx      # Task list, filters, stats, pagination
│           └── AdminPanel.jsx     # User management table (admin only)
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

> **Note:** If your MongoDB password contains special characters (e.g. `@`), URL-encode them (`@` → `%40`).

### 3. Start the Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
node node_modules/vite/bin/vite.js --force
```

### 4. Access

| Service | URL |
|---|---|
| Frontend App | http://localhost:5173 |
| Backend API | http://localhost:5000/api/v1 |
| Swagger Docs | http://localhost:5000/api/v1/docs |
| Health Check | http://localhost:5000/health |

---

## Role-Based Access Control (RBAC)

### Roles

| Feature | `user` | `admin` |
|---|---|---|
| Register / Login | ✅ | ✅ |
| View & manage **own** tasks | ✅ | ✅ |
| View **all users'** tasks | ❌ | ✅ |
| Delete **any** task | ❌ | ✅ |
| Access Admin Panel | ❌ | ✅ |
| View platform statistics | ❌ | ✅ |
| Change user roles | ❌ | ✅ |
| Activate / deactivate users | ❌ | ✅ |

### How it works — 3 layers

**Layer 1 — JWT carries the role**
```js
jwt.sign({ id, email, role: "admin" }, JWT_SECRET)
// Role is embedded at login/register — no extra DB call needed
```

**Layer 2 — Middleware enforces at route level**
```js
router.use(authenticate, authorize('admin')); // admin routes
router.use(authenticate);                     // user routes
```

**Layer 3 — Service enforces data ownership**
```js
if (role !== 'admin') filter.user_id = userId; // users see only own tasks
```

### RBAC Test Results (verified)

| Test | Expected | Result |
|---|---|---|
| User GET /tasks | Own tasks only (1) | ✅ 200 — 1 task |
| Admin GET /tasks | All tasks (2+) | ✅ 200 — all tasks with owner info |
| User GET /tasks/:adminTaskId | Forbidden | ✅ 403 — Access denied |
| User GET /admin/stats | Forbidden | ✅ 403 — Required role: admin |
| Admin GET /admin/stats | Platform stats | ✅ 200 — full stats |
| Admin DELETE /tasks/:userTaskId | Cross-delete works | ✅ 200 — Task deleted |
| POST /tasks without title | Validation error | ✅ 422 — Title is required |
| Login with wrong password | Unauthorized | ✅ 401 — Invalid credentials |
| Request with no token | Unauthorized | ✅ 401 — No token provided |

---

## API Reference

### Authentication (public)

| Method | Endpoint | Description | Body |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user | `name, email, password, role` |
| POST | `/api/v1/auth/login` | Login and receive JWT | `email, password` |
| GET | `/api/v1/auth/me` | Get current user profile | — |

### Tasks (authenticated)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/tasks` | List tasks (paginated, filterable) | Own tasks for user / All for admin |
| GET | `/api/v1/tasks/:id` | Get task by ID | Owner or admin |
| POST | `/api/v1/tasks` | Create a task | Any authenticated user |
| PATCH | `/api/v1/tasks/:id` | Update a task | Owner or admin |
| DELETE | `/api/v1/tasks/:id` | Delete a task | Owner or admin |

**Query parameters:** `?status=pending&priority=high&page=1&limit=10`

### Admin (admin role only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/stats` | Platform-wide user & task statistics |
| GET | `/api/v1/admin/users` | List all users (paginated) |
| PATCH | `/api/v1/admin/users/:id/role` | Change a user's role |
| PATCH | `/api/v1/admin/users/:id/toggle-status` | Activate or deactivate a user |

---

## Database Schema

### Users Collection
```js
{
  name:       String (required, 2–100 chars),
  email:      String (required, unique, lowercase),
  password:   String (bcrypt hashed, 12 rounds, hidden from responses),
  role:       String (enum: 'user' | 'admin', default: 'user'),
  is_active:  Boolean (default: true),
  created_at: Date,
  updated_at: Date
}
```

### Tasks Collection
```js
{
  title:       String (required, max 255 chars),
  description: String (optional, max 2000 chars),
  status:      String (enum: 'pending' | 'in_progress' | 'completed' | 'cancelled'),
  priority:    String (enum: 'low' | 'medium' | 'high'),
  due_date:    Date (optional),
  user_id:     ObjectId → ref: User (indexed),
  created_at:  Date,
  updated_at:  Date
}
// Indexes: user_id (for ownership queries), status (for filters)
```

---

## Security Practices

| Practice | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| JWT | Signed with secret, 7-day expiry, verified on every protected request |
| Role enforcement | Middleware chain: `authenticate → authorize('admin')` |
| Input validation | express-validator on all endpoints, field-level error messages |
| Rate limiting | 100 req/15min globally; 20 req/15min on auth routes |
| Security headers | Helmet.js (XSS protection, HSTS, CSP, etc.) |
| CORS | Restricted to configured origin only |
| Auto-logout | Frontend clears token and redirects to /login on any 401 response |

---

## Frontend Features

| Feature | Details |
|---|---|
| Register | Role selector (User / Admin) with field-level validation errors |
| Login | JWT stored in localStorage, auto-redirect to dashboard |
| Protected routes | Unauthenticated users always redirected to /login |
| Task dashboard | Create, edit, delete tasks with status/priority/due date |
| Filters | Filter by status and priority, paginated results |
| Stats cards | Live counts of total/pending/in-progress/completed tasks |
| Admin Panel | Visible only to admins — user table, role management, activate/deactivate |
| Toast notifications | Success/error messages for every API action |
| Auto-logout | On token expiry or invalid token, clears session and redirects |

---

## Scalability Notes

### Current Architecture
Stateless API with modular structure (`modules/` = feature folders). Adding a new entity (e.g. `products`) only requires creating a new folder with routes/controller/service/validation — zero changes to existing code.

### Horizontal Scaling
- Stateless JWT auth — any number of instances can run behind a load balancer (Nginx, AWS ALB)
- MongoDB Atlas auto-scales storage and handles connection pooling

### Caching (Redis extension)
```js
// Cache task lists per user — reduce DB reads
redis.setex(`tasks:${userId}:page1`, 60, JSON.stringify(tasks));

// Invalidate on write
redis.del(`tasks:${userId}:*`);
```

### Database Optimization
- Indexes on `tasks.user_id` and `tasks.status` for fast filtered queries
- MongoDB Atlas supports read replicas for horizontal read scaling
- Aggregation pipelines for analytics (admin stats)

### Microservices Path
The module structure maps directly to independent services:
- `auth-service` — registration, login, token management
- `tasks-service` — CRUD, owned per user
- `admin-service` — user management, analytics

### Docker Deployment
```bash
docker build -t primetrade-api ./backend
docker run -p 5000:5000 --env-file backend/.env primetrade-api
```

A `docker-compose.yml` can orchestrate API + MongoDB + Redis for full deployment parity.

---

## API Documentation

Interactive Swagger UI available at: **http://localhost:5000/api/v1/docs**

All endpoints are documented with:
- Request body schemas
- Query parameter descriptions
- Response codes and examples
- JWT Bearer token authentication
