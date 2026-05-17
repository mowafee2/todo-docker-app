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


### 3. `docker-compose.yml`
Hints:
- 3 services: `mongodb`, `backend`, `frontend`
- Use a custom network so containers talk by name
- MongoDB needs a named volume for persistence
- Backend MONGO_URI should use `mongodb` as hostname
- Use `depends_on` with `condition: service_healthy`
