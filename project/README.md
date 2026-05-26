Warehouse Logistics Management System (WLMS)

CS Elective 2 — Finals: Activity #2 | Group 3

A full-stack web application built using React (Vite) for the frontend and
PHP/MySQL for the backend RESTful API. This system is designed for secure
management of warehouse hubs, driver assignments, and real-time shipment
tracking.

📁 Project Structure

project/
├── frontend/                   ← React + Vite UI
│   ├── src/
│   │   ├── components/         ← Sidebar, TopHeader, ProtectedRoute
│   │   └── pages/
│   │       ├── Landing.jsx     ← Industrial-themed Image Slider
│   │       ├── Dashboard.jsx   ← Dynamic Analytics & Statistics
│   │       ├── Warehouse.jsx   ← Hub Management (CRUD)
│   │       ├── Shipments.jsx   ← Relational Logistics Tracking
│   │       ├── Profile.jsx     ← User Management & Avatar Upload
│   │       ├── Register.jsx    ← Manager Registration with Validation
│   │       └── Login.jsx       ← Secure Portal Authentication
│
└── backend/                    ← PHP RESTful API Hub
    ├── auth/                   ← Auth, Profile, and Registration logic
    ├── logistics/              ← Operations logic (Warehouses, Drivers, Shipments)
    ├── activities/             ← Reporting and Dashboard Stats logic
    ├── uploads/                ← Image storage (Profiles/Shipments subfolders)
    ├── db.php                  ← PDO Database Connection (Secure)
    ├── config.php              ← Key Management for Encryption
    └── encryption_helper.php   ← AES-256-GCM Encryption Engine

🛠️ Setup Instructions

Step 1 — Database Configuration (phpMyAdmin)

1.  Create a new database named: warehouse_db.
2.  Import the provided warehouse_db.sql file. This creates all necessary tables
    (users, warehouses, drivers, shipments) with relational integrity and sample
    data.

Step 2 — Backend Configuration (PHP)

1.  Move the backend/ folder into your XAMPP htdocs directory:
    C:/xampp/htdocs/project/backend/.
2.  Ensure Apache and MySQL are running in the XAMPP Control Panel.
3.  Ensure the folder backend/uploads/profiles/ exists and has write permissions
    for image uploads.

Step 3 — Frontend Configuration (React)

1.  Open a terminal inside the frontend/ folder.
2.  Run npm install to download dependencies.
3.  Run npm run dev to start the development server.
4.  Access the app via the provided Vite URL (typically http://localhost:3000).

🔒 Advanced Security Implementation (AES-256-GCM)

To satisfy modern cybersecurity requirements, the system implements
Authenticated Encryption at Rest:

  - Target Fields: license_number and contact_no within the drivers table are
    encrypted.
  - Algorithm: AES-256-GCM (Galois/Counter Mode) provides both confidentiality
    and data integrity.
  - Key Management: The 32-character secret master key is stored in
    backend/config.php, decoupled from the main logic for enhanced security.
  - IV & Tag Storage: Each record stores its own unique Initialization Vector
    (IV) and Authentication Tag using a Base64 encoded format
    (ciphertext::iv::tag).
    - API-Level Decryption: The backend API automatically decrypts these fields
      before returning the data to the React frontend, ensuring managers see
      readable data while the database remains secured against leaks.

✅ Demo Script Checklist

| Step | Feature to Demonstrate  | Expected Result                                                                   |
| ---- | ----------------------- | --------------------------------------------------------------------------------- |
| 1    | **Landing Page**        | Automatic background switching between warehouse images.                          |
| 2    | **Registration**        | Validation prevents weak passwords from being sent to API.                        |
| 3    | **Secure Login**        | Redirects to Dashboard and saves `user_id` to local storage.                      |
| 4    | **Analytics Dashboard** | Dashboard cards fetch live counts from the stats API.                             |
| 5    | **Database Security**   | **Show phpMyAdmin:** Demonstrate that driver contact/license data is "Gibberish". |
| 6    | **Frontend Decryption** | Show the UI where the same encrypted driver data is now readable.                 |
| 7    | **Manager Profile**     | Upload a new Avatar and update username using POST/Multipart data.                |
| 8    | **Relational Details**  | Click Warehouse details to see nested shipments and driver names (JOINs).         |
| 9    | **Protected Routes**    | Attempting to access `/home` while logged out triggers a kick-back to `/login`.   |

📡 Core API Endpoints

| Method | Endpoint                                                  | Action                                |
| ------ | --------------------------------------------------------- | ------------------------------------- |
| POST   | `/auth/login.php`                                         | Authenticate Manager Session          |
| POST   | `/auth/profile.php`                                       | Update User Details & Upload File     |
| GET    | `/logistics/logistics_manager.php?action=list_warehouses` | Fetch all active hubs                 |
| POST   | `/logistics/logistics_manager.php?action=add_driver`      | Encrypt and register new Personnel    |
| GET    | `/activities/get_dashboard_stats.php`                     | Fetch system-wide performance metrics |

Developed by: Group 3 - BSCS 3B
