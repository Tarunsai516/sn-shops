# SN Shops — Shop Management System

A production-ready full-stack web application for small retail businesses. Manage inventory, record sales, track customers and debts in one place.

---

## 📐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2.5, Spring Security (JWT) |
| Database | MySQL 8.0 via Spring Data JPA + Hibernate |
| Frontend | React 18 (Vite), Tailwind CSS v4, Axios, React Router v6 |
| Auth | Stateless JWT (jjwt 0.12.x) |
| Infrastructure | Docker Compose (MySQL) |

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
├── frontend/                       # React 18 + Vite
│   └── src/
│       ├── api/                    # Axios service layer
│       ├── components/             # Layout, Modal
│       ├── context/                # AuthContext (JWT + localStorage)
│       ├── pages/                  # Login, Register, Dashboard, POS, Products, Customers, Debts
│       └── utils/                  # helpers (currency, date, badge)
└── docker-compose.yml              # MySQL 8 with persistent volume
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- Docker & Docker Compose (for MySQL)

---

### Step 1 — Start MySQL with Docker

```bash
docker-compose up -d
```

This starts MySQL 8 on port `3306` with:
- Database: `your_dbname`
- User: `your_username`
- Password: `your_password`

---

### Step 2 — Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on **http://localhost:8080**

> Tables are auto-created by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).  
> No SQL migrations needed.

---

### Step 3 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

> Vite proxies all `/api` requests to the Spring Boot server — no CORS issues in development.

---

## 🔐 First Use

1. Open **http://localhost:5173**
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
MySQL 8.0
  Port: 3306
  Database: your_dbname
  User: your_nmae / Password: your_password
  Root Password: your_password
  Volume: mysql_data (persistent)
```

---

## 🛡️ Security Notes

- JWT tokens expire in **24 hours** (configurable via `app.jwt.expiration-ms`)
- All endpoints except `/api/auth/**` require a valid token
- Passwords are BCrypt-hashed (strength 10)
- JWT secret is configurable via `application.properties`

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
