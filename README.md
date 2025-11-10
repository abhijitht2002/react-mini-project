# 🧠 Node.js Auth + Todo Backend

A fully functional **authentication + todo management API** built with pure **Node.js**, no external frameworks (like Express).  
Lightweight, fast, and easy to understand — perfect for learning or lightweight deployments.

---

## ✨ Features

- 👤 **User registration & login**  
  - Passwords are securely hashed using SHA-256  
  - Token-based authentication with simple token storage
- ✅ **CRUD for Todos**
  - Each user can manage their own todos
  - Supports add, update, delete, and get operations
- 🔒 **Authentication Middleware**
  - Protects all `/todos` routes with token verification
- 🧾 **Data stored in JSON files**
  - Simple and filesystem-based (no database setup required)
- 🌐 **CORS enabled**
  - Ready for frontend integration (React, Vue, etc.)
- 🧩 **Single server handles both Auth & Todo APIs**

---

## 🛠️ Tech Stack

- **Node.js (built-in http module)**
- **Crypto** for password hashing
- **Filesystem (fs/promises)** for persistence
- **No dependencies required**

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/abhijitht2002/react-mini-project.git
```

### 2. Run the Server
```bash
cd backend
node server.js
```

### 2. Run the App
```bash
cd frontend
npm run dev
```