# CS Elective 2 — Activity #2 (Finals)
## React + PHP + MySQL Authentication App

---

## 📁 Project Structure

```
project/
├── frontend/               ← React app (Vite)
│   ├── src/
│   │   ├── App.jsx         ← Router setup
│   │   ├── main.jsx        ← React entry point
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Register.jsx
│   │       ├── Login.jsx
│   │       └── Home.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/                ← PHP + MySQL
    ├── db.php
    ├── register.php
    ├── login.php
    └── database_setup.sql
```

---

## 🛠️ Setup Instructions

### Step 1 — Database (phpMyAdmin / MySQL CLI)
1. Open **phpMyAdmin** → go to the SQL tab
2. Paste and run the contents of `backend/database_setup.sql`
3. This creates the `auth_app` database and `users` table

### Step 2 — Backend (PHP)
1. Copy the entire `backend/` folder into your XAMPP `htdocs`:
   ```
   C:/xampp/htdocs/backend/
   ```
2. Make sure **Apache** and **MySQL** are running in XAMPP
3. Test it: open `http://localhost/backend/` in your browser

### Step 3 — Frontend (React)
1. Open a terminal inside the `frontend/` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser at **http://localhost:3000**

---

## ✅ Demo Script Checklist

| Step | What to show |
|------|-------------|
| 1 | Open `http://localhost:3000/` → Landing page appears |
| 2 | Refresh → still on `/`, confirms it's the true landing page |
| 3 | Go to `/register` → enter weak password → validation error shown |
| 4 | Enter valid password → success message + link to login |
| 5 | Go to `/login` → try unregistered email → "User not registered" |
| 6 | Login with registered account → redirected to `/home` |
| 7 | Type `/home` directly in URL while logged out → redirected to `/login` |
| 8 | Logout → try `/home` again → still blocked |
| 9 | Show code files + phpMyAdmin users table |

---

## 🔑 How It Works (Summary)

### Authentication Flow
```
Register → PHP hashes password (bcrypt) → stores in MySQL
Login    → PHP verifies hash → returns user data
React    → saves user to localStorage
ProtectedRoute → checks localStorage on every /home visit
Logout   → clears localStorage → /home is blocked again
```

### Password Validation (Frontend — Register.jsx)
Done entirely in JavaScript before any network request:
- Minimum 8 characters
- At least 1 uppercase letter (`/[A-Z]/`)
- At least 1 number (`/[0-9]/`)
- At least 1 symbol (`/[^A-Za-z0-9]/`)

### CORS Headers (Backend)
Each PHP file includes:
```php
header('Access-Control-Allow-Origin: http://localhost:3000');
```
This allows the React app (port 3000) to communicate with PHP (port 80).
