# 🛒 NovaStore — MERN E-Commerce Platform

> A production-ready full-stack e-commerce platform built with **MongoDB, Express, React and Node.js**. Features JWT auth with email verification, password reset, role-based access control, admin dashboard, shopping cart, order tracking, audit logging, and full deployment configuration for **shafay.online**.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based login & signup
- **Email verification** on signup (SMTP / Ethereal fallback)
- **Forgot password** + email reset flow
- Role-based access: **Customer** and **Admin**
- Admin signup requires a secret code
- Audit logging for all admin actions

### 🛍️ Customer Experience
- Browse & search products with category filtering
- Product detail pages
- Add to cart, update quantities, remove items
- Checkout and place orders
- Order history via customer dashboard

### 🛠️ Admin Dashboard
- Stats overview (users, orders, revenue)
- Manage products — add, edit, delete
- Manage orders — update status (pending → shipped → delivered)
- Manage users — view all registered customers

### 🎨 UI/UX
- Premium dark glassmorphism design
- Fully responsive layout
- Toast notifications (react-hot-toast)
- Client-side AND server-side form validation

### 🚀 Deployment Ready
- Environment variable templates for both frontend and backend
- CORS configured via `CLIENT_URL` env var
- Netlify `_redirects` + `vercel.json` for SPA routing
- Render-compatible backend (auto-injected `PORT`)

---

## 🗂️ Project Structure

```
NovaStore/
│
├── client/                              # React frontend (Vite)
│   ├── public/
│   │   ├── _redirects                   # Netlify SPA fallback
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── AdminNav.jsx
│   │   │   ├── ProtectedRoute.jsx       # Requires login
│   │   │   └── AdminRoute.jsx           # Requires admin role
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── VerifyEmail.jsx          # Email verification
│   │   │   ├── ForgotPassword.jsx       # Request reset link
│   │   │   ├── ResetPassword.jsx        # Set new password
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageProducts.jsx
│   │   │       ├── ManageOrders.jsx
│   │   │       └── ManageUsers.jsx
│   │   ├── utils/
│   │   │   └── api.js                   # Axios instance (reads VITE_API_URL)
│   │   ├── App.jsx                      # Router setup
│   │   └── main.jsx                     # Entry point
│   ├── .env.example                     # Frontend env template
│   ├── vercel.json                      # Vercel SPA routing config
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
├── server/                              # Express backend API
│   ├── config/
│   │   └── db.js                        # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js            # Login, signup, verify, reset
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                      # JWT verification
│   │   └── adminAuth.js                 # Admin role check
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── AuditLog.js                  # Admin action logging
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── sendEmail.js                 # SMTP / Ethereal email sender
│   │   ├── tokens.js                    # JWT helpers
│   │   └── audit.js                     # Audit log helper
│   ├── seed.js                          # Seeds DB with sample data
│   ├── clean.js                         # Clears all DB collections
│   ├── server.js                        # Express entry point
│   ├── .env.example                     # Backend env template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Vite |
| Styling | Vanilla CSS — dark glassmorphism design system |
| State | React Context API |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (SMTP / Ethereal fallback) |
| Validation | express-validator + client-side |
| Notifications | react-hot-toast |
| Deployment | Render (backend) + Netlify/Vercel (frontend) |

---

## 🚀 Local Setup

### Prerequisites
- **Node.js** v18+ — [Download](https://nodejs.org)
- **MongoDB** — [Local](https://www.mongodb.com/try/download/community) or [Atlas (free)](https://www.mongodb.com/atlas)

### 1. Clone the repo
```bash
git clone https://github.com/mian-shafay/NovaStore.git
cd NovaStore
```

### 2. Install dependencies
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment
```bash
# Backend
cd server
cp .env.example .env
```
Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_long_random_secret
ADMIN_SECRET_CODE=ADMIN2024
CLIENT_URL=http://localhost:5173
PORT=5000
# SMTP optional — leave blank to use Ethereal (logs preview link)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

```bash
# Frontend
cd ../client
cp .env.example .env
```
Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed the database
```bash
cd server
npm run seed
```
Creates:
- **Admin**: `admin@shop.com` / `admin123`
- **Customers**: `ali@test.com`, `sara@test.com` / `test1234`
- **12 sample products** across categories

### 5. Run the app
Open **two terminals**:
```bash
# Terminal 1 — Backend
cd server && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev
# → http://localhost:5173
```

> Reset all data: `cd server && npm run clean`

---

## 🔌 API Endpoints

### Auth `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/signup` | Public | Register + send verification email |
| POST | `/login` | Public | Login, get JWT |
| GET | `/verify-email/:token` | Public | Verify email address |
| POST | `/forgot-password` | Public | Send password reset email |
| POST | `/reset-password/:token` | Public | Set new password |
| GET | `/profile` | Private | Get current user |

### Products `/api/products`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | List / search products |
| GET | `/:id` | Public | Get single product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Cart `/api/cart`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get user's cart |
| POST | `/` | Private | Add item |
| PUT | `/:itemId` | Private | Update quantity |
| DELETE | `/:itemId` | Private | Remove item |
| DELETE | `/` | Private | Clear cart |

### Orders `/api/orders`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Place order |
| GET | `/` | Private | Get my orders |
| GET | `/:id` | Private | Order details |

### Admin `/api/admin`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | Dashboard stats |
| GET | `/orders` | Admin | All orders |
| PUT | `/orders/:id` | Admin | Update order status |
| GET | `/users` | Admin | All users |

---

## 🌐 Deployment (shafay.online)

| Layer | Service | URL |
|-------|---------|-----|
| Database | MongoDB Atlas M0 | — |
| Backend | Render (free web service) | `https://api.shafay.online` |
| Frontend | Netlify or Vercel | `https://shafay.online` |

See **DEPLOY.md** in this repo for the full step-by-step guide including DNS setup, SMTP config, and cold-start tips.

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shop.com` | `admin123` |
| Customer | `ali@test.com` | `test1234` |
| Customer | `sara@test.com` | `test1234` |

> ⚠️ Admin signup requires secret code set in `server/.env` as `ADMIN_SECRET_CODE`

---

## 👤 Author

**Muhammad Shafay**
CS Student · 2025

---

## 📄 License

This project is for educational purposes only.
