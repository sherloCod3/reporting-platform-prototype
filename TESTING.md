# API Testing Guide

This guide describes how to test the QReports backend API, specifically focusing on private endpoints that require authentication.

## 🛠 Prerequisites

-   Backend running (`npm start` or `npm run dev` in `backend/` directory).
-   Database accessible.
-   A valid user account (create one via `npm run create-user` if needed).

## 🚀 Quick Start: Interactive Test Script

We have provided a utility script to simplify testing authenticated endpoints.

1.  **Start the Backend**:
    ```bash
    cd backend
    npm run dev
    ```

2.  **Run the Tester** (in a new terminal):
    ```bash
    cd backend
    npm run test:api
    ```

3.  **Follow the Prompts**:
    -   **Email/Password**: Enter your credentials (default: `admin@example.com` / `admin123`).
    -   **Token**: The script will automatically log in and store the Bearer token.
    -   **Method/Endpoint**: Enter the HTTP method (e.g., `GET`) and endpoint (e.g., `/api/users`).
    -   **Body**: (For POST/PUT) Enter the JSON body.

    The script will output the response status, headers, and data.

## 🧪 Manual Testing (Postman / Curl)

If you prefer manual testing, follow these steps:

### 1. Obtain an Access Token
**Endpoint**: `POST http://localhost:3000/api/login`

**Body**:
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": { ... },
    "client": { ... }
  }
}
```

### 2. Make Authenticated Requests
Copy the `token` from the login response and add it to the `Authorization` header of your subsequent requests.

**Header**:
```
Authorization: Bearer <your-token-here>
```

**Example (GET /api/users)**:
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <your-token-here>"
```

## ⚠️ Common Issues

-   **401 Unauthorized**:
    -   Missing `Authorization` header.
    -   Invalid token format (must be `Bearer <token>`).
    -   Token expired.
-   **403 Forbidden**:
    -   Valid token but insufficient permissions (e.g., User trying to access Admin route).
-   **Connection Refused**:
    -   Backend is not running.
    -   Wrong port (default is 3000).

---

## 🏗 Future Improvements

-   [ ] Add integration tests using `jest` and `supertest`.
-   [ ] Automate end-to-end testing with `cypress` or `playwright`.
