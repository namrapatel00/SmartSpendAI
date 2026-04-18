# 💳 SmartSpend AI — Intelligent Expense & Credit Optimization System

> **Full-stack FinTech application** built with C# / ASP.NET Core + React that tracks expenses, optimizes credit card usage, and delivers AI-driven financial insights — all without any paid APIs.

[![Made with C#](https://img.shields.io/badge/Backend-C%23%20%2F%20ASP.NET%20Core-blue?logo=dotnet)](https://dotnet.microsoft.com/)
[![Made with React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev/)
[![DB: SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📸 Features

| Module | What it does |
|--------|-------------|
| 🔐 Auth | JWT-based login & registration |
| 💸 Expense Tracker | Add, filter, and delete transactions by month |
| 📋 Budget Manager | Set monthly limits per category with visual progress bars |
| 🃏 Card Manager | Add your cards with real cashback rates per category |
| 🤖 AI Engine | Rule-based recommendation engine — suggests best card per purchase |
| 📊 Dashboard | Charts, insights, missed cashback alerts, new card suggestions |

---

## 🧠 How the AI Works (No Paid APIs!)

The recommendation engine is a **rule-based decision system** built entirely in C#:

```
IF  user buys Groceries ($100)
AND Card A = 5% cashback on Food
AND Card B = 1% cashback on Food
THEN → Recommend Card A → saves $4 on this purchase
```

It also:
- Calculates **missed cashback** if the wrong card was used
- Generates **spending insights** based on category percentages
- **Suggests new credit cards** from a built-in database based on credit score + spending habits

---

## 🛠️ Tech Stack

```
Backend:   C# · ASP.NET Core 8 · Entity Framework Core · SQLite · JWT Auth · BCrypt
Frontend:  React 18 · React Router v6 · Recharts · Axios
Database:  SQLite (zero setup, file-based)
AI Layer:  Custom rule-based engine (no paid APIs)
```

---

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/SmartSpendAI.git
cd SmartSpendAI
```

### 2. Run the Backend

```bash
cd backend/SmartSpendAPI
dotnet restore
dotnet run
```

> API will start at `http://localhost:5000`
> SQLite database (`smartspend.db`) is created automatically — no setup needed!

### 3. Run the Frontend

```bash
cd frontend
npm install
npm start
```

> App opens at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT token |
| GET | `/api/expenses` | Get expenses (filter by month/year) |
| POST | `/api/expenses` | Add new expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/budgets` | Get budget status |
| POST | `/api/budgets` | Set/update budget |
| GET | `/api/cards` | Get user's credit cards |
| POST | `/api/cards` | Add a credit card |
| GET | `/api/dashboard` | Full AI dashboard data |
| GET | `/api/dashboard/recommend/{category}` | Best card for a category |

---

## 📁 Project Structure

```
SmartSpendAI/
├── backend/
│   └── SmartSpendAPI/
│       ├── Controllers/       # API endpoints
│       ├── Models/            # Database entities
│       ├── Data/              # EF Core DbContext
│       ├── Services/          # Auth + RecommendationEngine
│       ├── DTOs/              # Request/Response contracts
│       └── Program.cs         # App startup + config
└── frontend/
    └── src/
        ├── pages/             # Dashboard, Expenses, Budgets, Cards
        ├── components/        # Navbar
        ├── services/          # Axios API calls
        └── context/           # Auth state (React Context)
```

---

## 💡 Resume Bullet

> *Developed SmartSpend AI, a full-stack FinTech application using C# / ASP.NET Core and React that tracks expenses, manages budgets, and recommends optimal credit card usage through a rule-based recommendation engine — resulting in personalized cashback maximization and spending insights without reliance on external APIs.*

---

## 🔮 Future Enhancements

- [ ] Expense auto-categorization using NLP
- [ ] Email alerts for overspending
- [ ] Export to CSV / PDF reports
- [ ] Multi-currency support
- [ ] Mobile app (React Native)

---

## 👤 Author

**Charudeshna Patel**
- GitHub: [@ClifF-ipynb](https://github.com/ClifF-ipynb)
- LinkedIn: [Add your LinkedIn URL]

---

## 📄 License

MIT — free to use, fork, and build on.
