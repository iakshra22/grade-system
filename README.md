## 🎓 BFCET Grading & Academic Management System

A full-stack Student Grade Management System designed for **Baba Farid College of Engineering and Technology (BFCET)**. This platform enables faculty and administrators to manage student records, subject curricula, internal/external evaluations, and automate grade calculations with persistent storage via MySQL.

---

## 📌 Features
- **Admin & Faculty Authentication**: Secure login portal for managing student academic data.
- **Student Information Management**: Add, update, and manage student details including Roll Numbers and Branch/Section.
- **Subject & Course Mapping**: Define subjects, subject codes, and course credits.
- **Marks & Evaluation Entry**: Record internal assessments, lab evaluations, and final term marks.
- **Automated Grade Calculation**: Calculate SGPA/CGPA and letter grades based on standard university evaluation criteria.
- **Relational Data Persistence**: Structured MySQL database handling relationships between students, courses, and academic marks.

---

## 🛠️ Tech Stack

## Client (Frontend)
- **Framework**: Next.js / React
- **Styling**: Tailwind CSS & Modern UI Components

## Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: `mysql2/promise`
- **Environment Management**: `dotenv`

## Database
- **Engine**: MySQL (Relational Database)

---

## 📂 Project Structure

```text
grade_system/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App router (login, dashboard, layout)
│   │   ├── components/     # UI components (Toast, Modal, etc.)
│   │   └── utils/          # API utility helpers
│   ├── package.json
│   └── ...
└── server/                 # Node.js / Express backend
    ├── src/
    │   ├── config/         # Database connection pool & table initializers
    │   ├── controllers/    # Route controllers (admin, student, subject, marks)
    │   ├── middleware/     # Auth and validation middleware
    │   ├── models/         # Data models and query definitions
    │   └── routes/         # Express API route declarations
    ├── .env
    └── package.json
```

### 🚀 Getting Started
## Prerequisites:
* Node.js: v18.x or higher

* MySQL Server: Running locally on port 3306 (or a remote cloud instance)

* Git

### ⚙️ Database Configuration
Create a MySQL database for the grading system:

```sql
CREATE DATABASE grade_system_db;
```

Navigate to the server/ directory and create a .env file:

```sql
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grade_system_db
```

###  💻 Installation & Local Setup
##  Backend Setup

```sql
# Navigate to backend folder
cd server

# Install dependencies
npm install

# Start the backend development server
npm run dev
```

## Frontend Setup

 ```sql
# Open a new terminal and navigate to client folder
cd client

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

The frontend will run at http://localhost:3000 and the backend will run at http://localhost:5000.

### 🗄️ Database Schema
* admins:-  Manages portal credentials (id, username, password, created_at).

* students:-  Stores institutional profile details (id, name, roll_number, email, created_at).

* subjects:-  Stores course directory (id, subject_name, subject_code).

* marks:-  Foreign key mapping across students and subjects for score tracking (id, student_id, subject_id, marks_obtained, total_marks).

### 🤝 Contributing
* Fork the repository

* Create your feature branch (git checkout -b feature/NewFeature)

* Commit your changes (git commit -m "Add new feature")

* Push to the branch (git push origin feature/NewFeature)

* Open a Pull Request

### 📄 License
This project is developed for academic evaluation purposes at Baba Farid College of Engineering and Technology (BFCET).
