# 🐳 TaskFlow — Docker Training Project

Full-stack Todo app. Your job: write all the Docker files!

## Stack
- **Frontend** → React + Vite (port 3000)
- **Backend**  → Node.js + Express (port 5000)
- **Database** → MongoDB (port 27017)

---

## 📁 Structure

```
todo-app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx       ← React UI + API calls
│   │   ├── main.jsx      ← Entry point
│   │   └── index.css     ← Styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   └── server.js     ← Express API + Mongoose
│   └── package.json
│
├── .env                  ← Environment variables
└── .gitignore
```

---

## 🎯 Your Docker Tasks

You need to create these files yourself:

### 1. `frontend/Dockerfile`
Hints:
- Base image: `node:18-alpine`
- Install deps → build → serve the `/dist` folder
- Try a multi-stage build (builder → serve)
- Expose port 3000

### 2. `backend/Dockerfile`
Hints:
- Base image: `node:18-alpine`
- Copy package.json → npm install → copy source
- Don't run as root (create a user!)
- Expose port 5000
- Add a HEALTHCHECK

### 3. `docker-compose.yml`
Hints:
- 3 services: `mongodb`, `backend`, `frontend`
- Use a custom network so containers talk by name
- MongoDB needs a named volume for persistence
- Backend MONGO_URI should use `mongodb` as hostname
- Use `depends_on` with `condition: service_healthy`

---

## 🔌 API Reference

| Method | Endpoint        | Body                              |
|--------|-----------------|-----------------------------------|
| GET    | /api/todos      | —                                 |
| POST   | /api/todos      | `{ text, priority, tag }`         |
| PATCH  | /api/todos/:id  | `{ done?, text?, priority? }`     |
| DELETE | /api/todos/:id  | —                                 |
| GET    | /api/health     | —                                 |

---

## ✅ How to test when you're done

```bash
docker compose up --build

# Frontend → http://localhost:3000
# Health   → http://localhost:5000/api/health
# MongoDB  → localhost:27017 (optional, can be internal-only)

# Check containers are running
docker ps

# Check logs
docker compose logs -f backend
```
