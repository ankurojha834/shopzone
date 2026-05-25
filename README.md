# 🛍 ShopZone – React + Express E-Commerce App

A full-stack e-commerce app converted from vanilla HTML/JS to **React + JSX** (frontend) and **Express.js** (backend).

## Features
- 🛍 Product listing with category filtering, search, and sort
- ✨ **AI-powered smart search** using Groq LLM (supports English, Hindi, Hinglish)
- 🛒 Cart management (add, update quantity, remove)
- 📦 Order placement & order history
- ❤️ Wishlist (local)
- 🔔 Toast notifications
- 💀 Skeleton loading states

---

## Project Structure

```
shopzone/
├── backend/
│   ├── server.js        # Express API (products, cart, orders, AI search)
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx              # Root component
│       ├── api.js               # API utility functions
│       ├── index.css            # Global styles + CSS variables
│       ├── main.jsx             # React entry point
│       ├── components/
│       │   ├── Navbar.jsx       # Top nav with search + AI toggle
│       │   ├── CategoryBar.jsx  # Category filter tabs
│       │   ├── ProductCard.jsx  # Product card with add-to-cart
│       │   ├── CartPanel.jsx    # Slide-out cart drawer
│       │   ├── OrdersPanel.jsx  # Slide-out orders drawer
│       │   └── SuccessModal.jsx # Order confirmation modal
│       └── context/
│           ├── CartContext.jsx  # Global cart state
│           └── ToastContext.jsx # Global toast notifications
└── package.json         # Root convenience scripts
```

---

## Getting Started

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Run Backend

```bash
cd backend
npm start
# Server starts on http://localhost:3001
```

Or with auto-reload:
```bash
npm run dev
```

### 3. Run Frontend

```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

The Vite dev server proxies all `/api` calls to `http://localhost:3001` automatically.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products (supports `?category=`, `?search=`, `?sort=`) |
| GET | `/api/products/:id` | Single product |
| GET | `/api/categories` | All categories |
| GET | `/api/smart-search?q=` | AI-powered search via Groq |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:productId` | Update item quantity |
| DELETE | `/api/cart/:productId` | Remove item |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | All orders |

---

## Environment Variables

```bash
# Backend (optional — has a default fallback key)
GROQ_API_KEY=your_groq_api_key_here
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, JSX, Vite |
| Backend | Express.js, Node.js |
| AI Search | Groq API (llama-3.1-8b-instant) |
| Styling | CSS Variables, Inline styles |
| Fonts | Outfit + Playfair Display (Google Fonts) |
