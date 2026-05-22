# 📒 Project Requirements — Notes App (MERN Stack)

## 📌 Project Overview
This is a full-stack **Notes Management Application** built using the MERN-inspired architecture (Node.js + React.js + SQL/MongoDB).  

The system allows authenticated users to **create, read, update, and delete (CRUD)** their personal notes securely. Each user can only access their own notes.

The project also focuses on **production-level engineering practices** such as:
- Logging
- Exception handling
- Unit testing
- Code quality analysis
- Git workflow

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Jest (Unit Testing)
- Axios (API Calls)
- React Router DOM

### Backend
- Node.js
- Express.js
- MySQL (or PostgreSQL optional)
- Pino Logger (Logging system)
- Mocha + Chai (Unit Testing)
- JWT (Authentication)
- Bcrypt (Password hashing)

### DevOps / Tools
- Git & GitHub (Version Control)
- SonarQube (Code Quality Analysis)
- Nodemon (Development)
- ESLint (Code consistency)

---

## 🔐 Authentication & Authorization

### Requirements:
- User Registration (Sign Up)
- User Login (Sign In)
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes for notes
- Each user can only access their own notes

### Flow:
1. User registers → stored in DB
2. User logs in → receives JWT token
3. Token used for authenticated API requests

---

## 📝 Notes Management Module (CRUD)

### Features:
- Create new note
- Edit existing note
- Delete note
- View all notes (user-specific)
- Rich text support (optional)

### Rules:
- Notes are always linked to `user_id`
- No user can access another user's notes
- Soft delete (optional enhancement)

---

## 🗄️ Database Design

### Users Table
- id (PK)
- name
- email (unique)
- password
- created_at

### Notes Table
- id (PK)
- user_id (FK → Users.id)
- title
- content
- created_at
- updated_at

---

## 🧠 Backend Architecture

Follow clean architecture principles:


/backend
├── controllers
├── services
├── models
├── routes
├── middleware
├── utils
├── config
└── app.js


### Responsibilities:
- Controllers → request handling
- Services → business logic
- Models → database queries
- Middleware → auth, error handling, logging

---

## 📊 Logging System (Pino Logger)

### Requirements:
- Log every request & response
- Log errors globally
- Log authentication events (login, signup)
- Store logs in structured JSON format

### Example:
- INFO: User logged in
- ERROR: Database connection failed
- WARN: Unauthorized access attempt

---

## ⚠️ Exception Handling

### Requirements:
- Global error handler middleware
- Proper HTTP status codes
- User-friendly error messages
- Centralized logging of errors via Pino

---

## 🧪 Testing Strategy

### Backend (Mocha + Chai):
- Controller tests
- Service layer tests
- API endpoint testing

### Frontend (Jest):
- Component testing
- UI behavior testing
- API mocking tests

---

## 📈 Code Quality (SonarQube)

### Goals:
- Maintain clean code standards
- Detect bugs & vulnerabilities
- Maintain code coverage reports
- Enforce ESLint rules

---

## 🎨 Frontend (React.js)

### Pages:
- Sign Up Page
- Login Page
- Dashboard (Notes List)
- Note Editor Page
- User Profile (optional)

### Features:
- Responsive UI
- API integration with backend
- Protected routes
- State management (Context API or Redux optional)

---

## 🧭 Application Flow

### Authentication Flow:
Login → JWT → Dashboard Access

### Notes Flow:
Dashboard → Create/Edit Note → Save → Refresh List

---

## 🧩 Optional Features (Advanced)

- Real-time updates using Socket.io
- Search & filter notes
- Export notes to file (PDF/JSON)
- Import notes from file
- Dark mode UI
- Pagination for notes

---

## 🔀 Git Workflow

- main → production-ready code
- develop → development branch
- feature/* → individual features

Example:
- feature/auth-system
- feature/notes-crud
- feature/logging-system

---

## 🚀 Final Goal

Build a **scalable, production-ready Notes App** that demonstrates:
- Full-stack development skills
- Clean architecture
- Real-world engineering practices
- Scalable backend design
- Professional frontend structure

---

## 📌 Notes for AI Assistant (Important)

- Always follow modular architecture
- Keep backend logic separated (controller/service/model)
- Ensure all APIs are RESTful
- Use consistent error handling
- Always log critical actions using Pino
- Write testable code (avoid tight coupling)
- Prefer clean and readable code over shortcuts

---