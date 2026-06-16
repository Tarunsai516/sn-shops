# SN Shops — Shop Management System

A production-ready full-stack web application for small retail businesses. Manage inventory, record sales, track customers and debts in one place.

---

## 📐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2.5, Spring Security (JWT) |
| Database | PostgreSQL 16 via Spring Data JPA + Hibernate |
| Frontend | React 19 (Vite), Tailwind CSS v4, Axios, React Router v6 |
| Auth | Stateless JWT (jjwt 0.12.x) |
| Infrastructure | Docker Compose, Render, Vercel, Neon |

---

## 🏗️ Project Structure

```
sn-shops/
├── backend/                        # Spring Boot 3.x
│   ├── pom.xml
│   └── src/main/java/com/snshops/
│       ├── config/                 # JwtService, JwtAuthFilter, SecurityConfig, CorsConfig
│       ├── controller/             # Auth, Product, Customer, Sale, Payment, Dashboard
│       ├── service/                # Business logic (all @Transactional)
│       ├── repository/             # JPA repositories
│       ├── entity/                 # User, Product, Customer, Sale, SaleItem, Payment
│       ├── dto/                    # Request / Response DTOs
│       ├── enums/                  # Role, PaymentStatus
│       └── exception/              # GlobalExceptionHandler + custom exceptions
├── frontend/                       # React 19 + Vite
│   └── src/
│       ├── api/                    # Axios service layer
│       ├── components/             # Layout, Modal
│       ├── context/                # AuthContext (JWT + localStorage)
│       ├── pages/                  # Login, Register, Dashboard, POS, Products, Customers, Debts
│       └── utils/                  # helpers (currency, date, badge)
└── docker-compose.yml              # PostgreSQL 16 with persistent volume
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- Docker & Docker Compose (for local PostgreSQL)

---

### Step 1 — Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL 16 on port `5432` with:
- Database: `yourdb name`
- User: `user name`
- Password: `user password`

---

### Step 2 — Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on **https://sn-shops-backend.onrender.com**

> Tables are auto-created by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).  
> No SQL migrations needed.

> For production, Render hosts the backend, Neon hosts PostgreSQL, and Vercel hosts the frontend.

---

### Step 3 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **https://sn-shops.vercel.app/**

> Vite proxies all `/api` requests to the Spring Boot server — no CORS issues in development.

### Production Deployment

#### Backend on Render
1. Create a Render Blueprint from [render.yaml](render.yaml).
2. Use the backend Dockerfile at [backend/Dockerfile](backend/Dockerfile).
3. Set environment variables on Render:
  - `DB_URL=jdbc:postgresql://<neon-host>:5432/<db-name>?sslmode=require`
  - `DB_USERNAME=<neon-username>`
  - `DB_PASSWORD=<neon-password>`
  - `JWT_SECRET=<strong-random-secret>`
  - `ALLOWED_ORIGINS=https://<your-vercel-domain>`
  - `JWT_EXPIRATION_MS=86400000`
  - `PORT=8080`
4. Health check path: `/actuator/health`

#### Frontend on Vercel
1. Import the GitHub repo into Vercel.
2. Set the root directory to `frontend`.
3. Add `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com`.
4. Build command: `npm run build`.
5. Output directory: `dist`.

---

## 🔐 First Use

1. Open **https://sn-shops.vercel.app/**
2. Click **Register** to create your first admin account
3. Log in and start using the system

---

## 🔌 REST API Reference

All protected endpoints require header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Auth (public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products?search=&page=0&size=20` | List products with search & pagination |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Soft delete product |
| GET | `/api/products/low-stock` | Products at/below threshold |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers?search=` | List customers |
| GET | `/api/customers/{id}` | Get customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/{id}` | Update customer |
| GET | `/api/customers/{id}/history` | Purchase history |
| GET | `/api/customers/{id}/payments` | Payment history |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sales` | Create sale (atomic transaction) |
| GET | `/api/sales` | List all sales |
| GET | `/api/sales/{id}` | Get sale by ID |

### Payments & Debts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Record debt repayment |
| GET | `/api/payments/history` | Payment audit history |
| GET | `/api/debts` | All unpaid/partial sales |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Daily revenue, outstanding debt, low stock count |

---

## 📋 Sample API Requests

### Register
```json
POST /api/auth/register
{
  "username": "shopowner",
  "email": "owner@snshops.com",
  "password": "secret123"
}
```

### Create a Sale
```json
POST /api/sales
Authorization: Bearer <token>
{
  "customerId": 1,
  "amountPaid": 150.00,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

### Record a Payment
```json
POST /api/payments
Authorization: Bearer <token>
{
  "saleId": 5,
  "amountPaid": 75.00
}
```

---

## ⚙️ Business Logic

### Sale Creation (Atomic — `@Transactional`)
1. Validates all product stock availability
2. Deducts stock quantities atomically
3. Calculates `totalAmount`, `amountPaid`, `balanceDue`
4. Sets `paymentStatus`: `PAID` / `PARTIAL` / `UNPAID`
5. Updates `Customer.totalDebtBalance` if debt exists
6. Walk-in customers (no customerId) must pay full amount

### Debt Payment (`@Transactional`)
1. Validates payment ≤ remaining balance
2. Updates `Sale.balanceDue` and `Sale.paymentStatus`
3. Reduces `Customer.totalDebtBalance`
4. Creates `Payment` record for full audit trail

### Low Stock Alerts
Products with `stockQty <= lowStockThreshold` are flagged — visible on Dashboard and Products page.

---

## 🗄️ Database Schema

Tables auto-created by Hibernate:
- `users` — Auth + roles
- `products` — Inventory with soft delete
- `customers` — Customer profiles with debt balance
- `sales` — Sales with payment status
- `sale_items` — Line items with price snapshot at time of sale
- `payments` — Payment audit log

---

## 🐳 Docker Details

```yaml
# docker-compose.yml
PostgreSQL 16
  Port: 5432
  Database: snshopsDB
  User: postgres / Password: secret123
  Volume: postgres_data (persistent)
```

---

## 🛡️ Security Notes

- JWT tokens expire in **24 hours** (configurable via `app.jwt.expiration-ms`)
- All endpoints except `/api/auth/**` require a valid token
- Passwords are BCrypt-hashed (strength 10)
- JWT secret is configurable via `application.properties`
- Do not commit real secrets into `.env`, `.idea`, or deployment files

## 🔎 Exposure Review

- Tracked files were checked for secret-like values.
- [frontend/.env.production](frontend/.env.production) only contains a placeholder public API URL.
- [README.md](README.md) and tracked env templates now use placeholders instead of real credentials.
- Local files such as `.env` and `backend/.env` are ignored by Git and are not tracked.

---

## 🧪 Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Insufficient stock | `400 Bad Request` with item name + available qty |
| Payment > balance | `400 Bad Request` |
| Duplicate SKU | `409 Conflict` |
| Duplicate phone | `409 Conflict` |
| Walk-in + debt | `400 Bad Request` (full payment required) |
| Invalid token | `401 Unauthorized` |
| Resource not found | `404 Not Found` |
| Negative values | JSR-303 validation rejects |

All errors return consistent JSON:
```json
{ "timestamp": "2024-01-01T10:00:00", "status": 400, "message": "Insufficient stock for 'Rice'. Available: 5, Requested: 10" }
```
