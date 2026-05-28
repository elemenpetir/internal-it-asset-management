# Internal IT Asset Management & Risk Scoring System

## Overview

Internal IT Asset Management & Risk Scoring System is a backend-focused web application for managing internal company IT assets, employee account activation, asset lifecycle status, asset assignments, returns, and audit logs.

This project is built as part of a 6-month full-stack learning roadmap. The current version focuses on the backend REST API using Node.js, Express, and MySQL/MariaDB. The frontend will be developed in the next phase using React.

The project is designed to represent a realistic internal IT workflow, not just a simple CRUD application. It includes authentication, role-based authorization, transactional workflows, audit logging, and asset assignment business rules.

---

## Current Status

Backend MVP is implemented.

Frontend development is planned for the next phase.

---

## Core Features

* Employee account activation flow
* JWT-based authentication
* Role-based authorization
* Asset category management
* IT asset management
* Asset assignment to employees
* Asset return flow
* Asset lifecycle status management
* Audit logging for important business operations
* Database transaction handling for critical workflows
* Global error handling for database constraint errors
* Basic API tests using Jest and Supertest

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MySQL / MariaDB
* mysql2
* JSON Web Token
* bcrypt
* dotenv

### Testing

* Jest
* Supertest

### Tools

* Postman
* phpMyAdmin / MySQL client
* Git / GitHub

---

## User Roles

| Role        | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| employee    | Regular employee account activated using registered employee data                |
| asset_admin | Admin role responsible for managing assets, assignments, returns, and audit logs |
| manager     | Elevated role with access to management-level asset operations                   |

---

## Business Rules

### Employee Activation

Employees do not register freely with arbitrary roles.

The activation flow works as follows:

1. Admin creates or seeds employee data in the `employees` table.
2. Employee activates an account using:

   * email
   * employee number
   * password
3. Backend verifies that the email and employee number match an existing employee.
4. Backend creates a user account with the forced role `employee`.
5. Backend links `employees.user_id` to the new user account.

Employees cannot choose their own role.

### Admin Account

The first `asset_admin` account is created manually or through a seed process for MVP purposes.

After an admin account exists, future admin or manager account creation can be handled through protected admin endpoints in a later version.

Do not commit real admin credentials to the repository. Use local seed data or environment-specific setup instructions instead.

### Asset Assignment

Assets can only be assigned when their status is:

```txt
available
```

When an asset is assigned:

1. A new record is inserted into `asset_assignments`.
2. The asset status changes to `assigned`.
3. An audit log is created.

### Asset Return

When an assigned asset is returned:

1. The assignment status changes from `active` to `returned`.
2. `returned_at` is filled.
3. The asset status changes back to `available`.
4. An audit log is created.

### Audit Logging

Important operations are recorded in `audit_logs`, including:

* `CREATE_ASSET`
* `UPDATE_ASSET`
* `ASSIGN_ASSET`
* `RETURN_ASSET`

Audit logs store:

* entity type
* entity id
* action
* old value
* new value
* user who performed the action
* timestamp

---

## Transaction Handling

Database transactions are used for critical workflows that update multiple tables.

Implemented transactional workflows:

* Employee account activation
* Asset assignment
* Asset return
* Asset creation with audit log
* Asset update with audit log
* Asset assignment with audit log
* Asset return with audit log

This prevents partial database updates when one step succeeds but another step fails.

---

## Project Structure

```txt
.
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   └── planned for next phase
└── README.md
```

---

## Database Overview

Main tables:

| Table             | Purpose                                    |
| ----------------- | ------------------------------------------ |
| departments       | Stores company departments                 |
| employees         | Stores employee business data              |
| users             | Stores application login accounts          |
| asset_categories  | Stores asset category data                 |
| assets            | Stores IT asset records                    |
| asset_assignments | Stores asset assignment and return history |
| audit_logs        | Stores important system activity logs      |

---

## Environment Variables

Create a `.env` file inside the `backend/` directory.

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=internal_it_asset
DB_PORT=3306

JWT_SECRET=your_jwt_secret
```

Do not commit `.env` to GitHub.

For public repositories, provide a `.env.example` file instead of exposing real credentials.

Example `.env.example`:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=internal_it_asset
DB_PORT=3306

JWT_SECRET=replace_with_your_secret
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd internal-it-asset-management
```

Go to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the database and run the schema:

```bash
mysql -u root -p
```

Then execute the SQL schema from:

```txt
backend/database/schema.sql
```

Or import the schema using phpMyAdmin.

---

## Running the Backend

From the `backend/` directory:

```bash
npm run dev
```

The API will run on:

```txt
http://localhost:3000
```

---

## Running Tests

From the `backend/` directory:

```bash
npm test
```

Current basic test coverage includes:

* successful admin login
* invalid login password
* protected route without token
* employee forbidden from accessing audit logs

Note: the current tests use local development seed data. For production-grade testing, use a dedicated test database and test seed process.

---

## API Endpoints Summary

### Auth

| Method | Endpoint             | Access        | Description                    |
| ------ | -------------------- | ------------- | ------------------------------ |
| POST   | `/api/auth/login`    | Public        | Login user and return JWT      |
| POST   | `/api/auth/activate` | Public        | Activate employee account      |
| GET    | `/api/auth/me`       | Authenticated | Get current authenticated user |

---

### Asset Categories

| Method | Endpoint                | Access               | Description              |
| ------ | ----------------------- | -------------------- | ------------------------ |
| GET    | `/api/asset-categories` | Authenticated        | Get all asset categories |
| POST   | `/api/asset-categories` | asset_admin, manager | Create asset category    |

---

### Assets

| Method | Endpoint                 | Access               | Description         |
| ------ | ------------------------ | -------------------- | ------------------- |
| GET    | `/api/assets`            | Authenticated        | Get all assets      |
| GET    | `/api/assets/:id`        | Authenticated        | Get asset detail    |
| POST   | `/api/assets`            | asset_admin, manager | Create asset        |
| PUT    | `/api/assets/:id`        | asset_admin, manager | Update asset data   |
| PATCH  | `/api/assets/:id/status` | asset_admin, manager | Update asset status |

---

### Asset Assignments

| Method | Endpoint                            | Access               | Description               |
| ------ | ----------------------------------- | -------------------- | ------------------------- |
| GET    | `/api/asset-assignments`            | Authenticated        | Get all asset assignments |
| GET    | `/api/asset-assignments/:id`        | Authenticated        | Get assignment detail     |
| POST   | `/api/asset-assignments`            | asset_admin, manager | Assign asset to employee  |
| PATCH  | `/api/asset-assignments/:id/return` | asset_admin, manager | Return assigned asset     |

---

### Audit Logs

| Method | Endpoint          | Access               | Description    |
| ------ | ----------------- | -------------------- | -------------- |
| GET    | `/api/audit-logs` | asset_admin, manager | Get audit logs |

---

## Example API Flow

### 1. Login as Asset Admin

```http
POST /api/auth/login
```

```json
{
  "email": "<asset_admin_email>",
  "password": "<asset_admin_password>"
}
```

Response includes a JWT token.

Use a locally seeded asset admin account. Do not expose real credentials in the repository.

---

### 2. Create Asset Category

```http
POST /api/asset-categories
Authorization: Bearer <token>
```

```json
{
  "name": "Laptop"
}
```

---

### 3. Create Asset

```http
POST /api/assets
Authorization: Bearer <token>
```

```json
{
  "asset_code": "AST-0001",
  "name": "Laptop Lenovo ThinkPad",
  "category_id": 1,
  "brand": "Lenovo",
  "model": "ThinkPad T14",
  "serial_number": "SN-LNV-001",
  "purchase_date": "2025-01-15",
  "location": "IT Storage Room",
  "notes": "Initial asset record"
}
```

---

### 4. Assign Asset

```http
POST /api/asset-assignments
Authorization: Bearer <token>
```

```json
{
  "asset_id": 1,
  "employee_id": 1,
  "notes": "Assigned for daily operational work"
}
```

---

### 5. Return Asset

```http
PATCH /api/asset-assignments/1/return
Authorization: Bearer <token>
```

---

### 6. View Audit Logs

```http
GET /api/audit-logs
Authorization: Bearer <token>
```

---

## Error Handling

The API includes a global error handler for common database errors.

Examples:

| Error Case                    | Response                    |
| ----------------------------- | --------------------------- |
| Duplicate unique value        | `409 Conflict`              |
| Invalid foreign key reference | `400 Bad Request`           |
| Unexpected server error       | `500 Internal Server Error` |

---

## Security Notes

* Passwords are hashed using bcrypt.
* JWT is used for authenticated requests.
* Role-based middleware protects admin and manager endpoints.
* Employee activation forces the role to `employee`.
* Client-provided roles are not trusted.
* Audit logs record important system operations.
* Real credentials, JWT secrets, and database passwords must not be committed to the repository.
* Use `.env.example` for documentation and keep `.env` local.

---

## Testing Notes

The current tests use the development database and seed data.

For a production-grade test setup, a separate test database and test seed process should be added.

Avoid committing real test credentials. If test accounts are required, document them as local seed data only.

---

## Planned Next Phase

Frontend development using React.

Planned frontend features:

* Login page
* Employee activation page
* Asset dashboard
* Asset category management UI
* Asset list and detail UI
* Assignment and return workflow UI
* Audit log viewer
* Role-based navigation

---

## Future Improvements

* Dedicated employee management endpoints
* Admin user management endpoints
* Pagination and search for asset list
* Audit log filtering
* Separate test database
* Seed script
* More complete API test coverage
* Risk scoring module
* Asset analytics dashboard

---

## Project Purpose

This project is intended to demonstrate backend engineering fundamentals through a realistic internal company system, including:

* REST API design
* relational database modeling
* authentication and authorization
* business rule implementation
* transactional database operations
* audit logging
* API testing
* clean project documentation
