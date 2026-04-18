namespace SmartSpendAPI.Models;

// ─── User ───────────────────────────────────────────────────────────────────
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public int CreditScore { get; set; } = 650;
    public decimal MonthlyIncome { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<CreditCard> CreditCards { get; set; } = new List<CreditCard>();
}

// ─── Expense ─────────────────────────────────────────────────────────────────
public class Expense
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Title { get; set; } = "";
    public decimal Amount { get; set; }
    public string Category { get; set; } = "Other";   // Food, Travel, Bills, Shopping, Entertainment, Other
    public int? CreditCardId { get; set; }
    public CreditCard? CreditCard { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = "";
}

// ─── Budget ──────────────────────────────────────────────────────────────────
public class Budget
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Category { get; set; } = "";
    public decimal MonthlyLimit { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}

// ─── CreditCard ───────────────────────────────────────────────────────────────
public class CreditCard
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public User? User { get; set; }

    public string CardName { get; set; } = "";        // e.g. "Chase Freedom"
    public string Bank { get; set; } = "";             // e.g. "Chase"
    public string Last4Digits { get; set; } = "0000";

    // Cashback % per category (stored as decimal, e.g. 5.0 = 5%)
    public decimal FoodCashback { get; set; } = 1.0m;
    public decimal TravelCashback { get; set; } = 1.0m;
    public decimal BillsCashback { get; set; } = 1.0m;
    public decimal ShoppingCashback { get; set; } = 1.0m;
    public decimal EntertainmentCashback { get; set; } = 1.0m;
    public decimal OtherCashback { get; set; } = 1.0m;

    public decimal AnnualFee { get; set; } = 0;
    public int MinCreditScore { get; set; } = 580;
    public bool IsActive { get; set; } = true;
}

// ─── Category constants ───────────────────────────────────────────────────────
public static class Categories
{
    public static readonly string[] All = { "Food", "Travel", "Bills", "Shopping", "Entertainment", "Other" };
}
