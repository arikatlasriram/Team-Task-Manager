<<<<<<< HEAD
# 🚀 Team Task Manager

A full-stack collaborative Task Management Web Application — a simplified Trello/Asana built with React, Node.js, Express, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-18-blue)

---

## ✨ Features

- **User Authentication** — Signup/Login with JWT tokens, bcrypt password hashing
- **Project Management** — Create projects, add/remove members, role-based access (Admin / Member)
- **Task Management** — Kanban board (To Do / In Progress / Done), priority levels, due dates, assignment
- **Dashboard** — Real-time stats: total tasks, tasks by status/priority, overdue tasks, tasks per user with charts
- **Role-Based Access Control** — Admins have full control; Members can only update status of their assigned tasks

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS v3     |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas (Mongoose ODM)        |
| Auth       | JSON Web Tokens (JWT), bcryptjs     |
| Charts     | Recharts                            |
| Icons      | Lucide React                        |
| Deployment | Railway                             |

---

## 📁 Project Structure

```
Team-Task-Manager/
├── backend/
│   ├── models/         # Mongoose models (User, Project, Task)
│   ├── routes/         # Express routers (auth, projects, tasks, dashboard)
│   ├── middleware/     # JWT auth & role middleware
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/ # Navbar, ProtectedRoute
    │   ├── context/    # AuthContext
    │   ├── pages/      # Login, Signup, Dashboard, Projects, ProjectPage
    │   ├── services/   # Axios API instance
    │   └── main.jsx
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier) **or** local MongoDB

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/team-task-manager
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```
Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

The `.env` is already configured for local development:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🚂 Railway Deployment (Step-by-Step)

### Prerequisites
- [Railway account](https://railway.app) (free)
- [MongoDB Atlas](https://cloud.mongodb.com) free cluster

### Step 1 — Get MongoDB Atlas URI
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Create free cluster
2. Under **Database Access**, create a user with read/write permissions
3. Under **Network Access**, add `0.0.0.0/0` (allow all IPs for Railway)
4. Click **Connect** → **Drivers** → copy the connection string
5. Replace `<password>` with your DB user password

### Step 2 — Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo → choose the `backend/` folder as root directory
   - In Railway project settings → **Root Directory**: `backend`
3. Add environment variables in Railway **Variables** tab:
   ```
   PORT=5000
   MONGO_URI=<your atlas connection string>
   JWT_SECRET=<a long random string>
   FRONTEND_URL=https://your-frontend.railway.app
   ```
4. Railway auto-detects Node.js and runs `npm start`
5. Copy your backend public URL (e.g. `https://team-task-backend.railway.app`)

### Step 3 — Deploy Frontend on Railway
1. In the same Railway project → **New Service** → **GitHub repo**
2. Choose the `frontend/` folder as root directory:
   - **Root Directory**: `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
4. Set build command: `npm run build`
5. Set start command: `npx serve dist -s -l 3000`

   > Or install `serve` as a dependency: `npm install serve` and set start to `serve dist -s`

6. Railway will build and serve the frontend. Copy the public URL.

### Step 4 — Connect Frontend ↔ Backend
- Go back to the backend service variables
- Update `FRONTEND_URL` to your frontend Railway URL
- Redeploy the backend service

### ✅ Verification
- Visit your frontend Railway URL
- Sign up → create a project → add tasks → verify dashboard stats

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/projects` | ✅ | List user's projects |
| POST | `/api/projects` | ✅ | Create project |
| GET | `/api/projects/:id` | ✅ | Get project + role |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |
| GET | `/api/projects/:id/tasks` | ✅ | List tasks (filtered by role) |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | ✅ | Get single task |
| PUT | `/api/tasks/:id` | ✅ | Update task (role-restricted) |
| DELETE | `/api/tasks/:id` | Admin | Delete task |
| GET | `/api/dashboard` | ✅ | Dashboard stats |

---

## 🔐 Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete tasks | ✅ | ❌ |
| Update task (full) | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| Add/remove members | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| View all project tasks | ✅ | ❌ (own only) |
| View dashboard | ✅ | ✅ |

---

## 📜 License
MIT
=======
# Team-Task-Manager
>>>>>>> 9f8995e334c979f326991827177f094c2e4176c2
