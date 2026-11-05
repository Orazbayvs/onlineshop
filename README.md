# 🛒 QuickMart | Full-Stack E-commerce Platform

**QuickMart** is a modern e-commerce platform developed as a final project for Web Development. The project is a complete Full-Stack application using Django REST Framework for the backend and Angular for the frontend.

---

## 👥 Project Team
*   **Rakhat** — Frontend Developer
*   **Orazbay** — Backend Developer
*   **Vadim** — Full-stack / UI Design

---

## 🚀 Key Features
- **User Roles**: Buyers and Sellers register on the site; a database administrator assigns Sales Manager and Warehouse Staff roles.
- **Product Catalog**: Browse products with category filtering and sorting by price/name.
- **Inventory**: Products have unique SKUs, non-negative stock, and purchase-time prices.
- **Checkout**: Customers provide a delivery address and choose a payment method. Checkout is atomic and reserves stock.
- **Demo Payments**: Card, bank-transfer, and cash-on-delivery choices are recorded as pending; no payment is charged and no card details are collected.
- **Customer Account**: Customers can view and update their own profile and see/cancel their own new orders.
- **Order Operations**: Managers update order statuses and review a 30-day sales report; warehouse staff prepare orders and update stock.
- **Map Integration**: Interactive maps for shop locations using Leaflet.
- **Security**: Secure authentication powered by JWT tokens.
- **Responsive Design**: Fully optimized for mobile and desktop viewing.

---

## 🛠 Technology Stack
### Backend
- **Django 6.0+**
- **Django REST Framework**
- **SimpleJWT** (Authentication)
- **SQLite** (Database)

### Frontend
- **Angular 17+** (Standalone components)
- **TypeScript**
- **Leaflet** (Maps API)
- **FontAwesome** (Icons)

---

## 🏁 Getting Started

### 1. Prerequisites
Ensure you have **Python 3.x** and **Node.js** (with npm) installed on your system.

### 2. Backend Setup
```bash
cd configdrf
pip install -r requirements.txt
export DJANGO_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(50))')"
python manage.py migrate
python seed_data.py  # Add/update demo catalog data without resetting stock or orders
python manage.py runserver
```
*The backend will be available at: `http://127.0.0.1:8000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
*The website will be available at: `http://localhost:4200`*

## Temporary public presentation link

For a short demo, the Angular server proxies `/api` requests to Django so remote browsers use the laptop-hosted backend rather than their own `localhost`. Keep Django bound to localhost and run it with the ignored `configdrf/.env` file, which must contain a private `DJANGO_SECRET_KEY` and `DJANGO_DEBUG=False`:

```bash
cd configdrf
. .venv/bin/activate
set -a
. .env
set +a
python manage.py runserver 127.0.0.1:8000 --noreload
```

In another terminal, start the frontend and a Cloudflare Quick Tunnel:

```bash
cd frontend
npm start -- --configuration production --host 0.0.0.0 --port 4200
```

```bash
cloudflared tunnel --no-autoupdate --url http://127.0.0.1:4200
```

Share the `https://…trycloudflare.com` address printed by `cloudflared`. Anyone with the link can access the site, and the link stops working when the tunnel or laptop stops. Quick Tunnels are for testing, have no uptime guarantee, and generate a different hostname when restarted; use a registered domain and a named tunnel for a stable URL. Do not use this development setup for production or expose real customer data.

---

## 🔐 Admin Account
Create an administrator with a unique password after applying migrations:
```bash
python manage.py createsuperuser
```

---

## Order and staff workflow

The database stores customers (the authenticated `User` model), categories, products, orders, order items, and one payment record per new order. Each order item records quantity and the unit price at checkout. Stock is decremented within the same transaction that creates the order and payment; an insufficient-stock error rolls the transaction back. Cancelling a new order restores its reserved stock.

Passwords are stored as Django password hashes and are write-only in the API. Customer profile updates are limited to the customer's own email, name, phone, and address; staff roles are assigned by an administrator.

The Angular checkout is a demonstration flow only: selecting a payment method records a pending payment and does not charge a card. Promote an account to `manager` or `warehouse` in Django Admin (`/admin/`) to access the Operations page. Sales reports include paid, shipped, and delivered orders from the last 30 days; new and cancelled orders are excluded.

## 📖 API Documentation
Once the backend is running, the interactive API documentation is available at:
`http://127.0.0.1:8000/swagger/`