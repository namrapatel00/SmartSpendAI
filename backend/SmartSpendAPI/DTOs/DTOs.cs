namespace SmartSpendAPI.DTOs;

// ─── Auth ─────────────────────────────────────────────────────────────────────
public record RegisterDto(string Name, string Email, string Password, decimal MonthlyIncome, int CreditScore);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Name, int UserId);
public record UserProfileDto(string Name, string Email, decimal MonthlyIncome, int CreditScore, DateTime CreatedAt);
public record UpdateUserProfileDto(decimal MonthlyIncome, int CreditScore);

// ─── Expense ──────────────────────────────────────────────────────────────────
public record CreateExpenseDto(
    string Title,
    decimal Amount,
    string Category,
    int? CreditCardId,
    DateTime Date,
    string Notes
);

public record ExpenseResponseDto(
    int Id,
    string Title,
    decimal Amount,
    string Category,
    int? CreditCardId,
    string? CardName,
    DateTime Date,
    string Notes,
    decimal CashbackEarned
);

// ─── Budget ───────────────────────────────────────────────────────────────────
public record CreateBudgetDto(string Category, decimal MonthlyLimit, int Month, int Year);
public record BudgetStatusDto(
    int Id,
    string Category,
    decimal MonthlyLimit,
    decimal AmountSpent,
    decimal Remaining,
    bool IsOverBudget,
    int Month,
    int Year
);

// ─── Credit Card ──────────────────────────────────────────────────────────────
public record CreateCardDto(
    string CardName,
    string Bank,
    string Last4Digits,
    decimal FoodCashback,
    decimal TravelCashback,
    decimal BillsCashback,
    decimal ShoppingCashback,
    decimal EntertainmentCashback,
    decimal OtherCashback,
    decimal AnnualFee
);

public record CardResponseDto(
    int Id,
    string CardName,
    string Bank,
    string Last4Digits,
    decimal FoodCashback,
    decimal TravelCashback,
    decimal BillsCashback,
    decimal ShoppingCashback,
    decimal EntertainmentCashback,
    decimal OtherCashback,
    decimal AnnualFee
);

public record CardSearchResultDto(
    string Title,
    string Url,
    string Snippet
);

// ─── Recommendation ───────────────────────────────────────────────────────────
public record CardRecommendationDto(
    string Category,
    int BestCardId,
    string BestCardName,
    string BestCardBank,
    decimal BestCashbackPercent,
    string Reason
);

public record SpendingInsightDto(
    string Category,
    decimal TotalSpent,
    decimal Percentage,
    string Insight
);

public record DashboardDto(
    decimal MonthlyIncome,
    decimal RemainingSalaryThisMonth,
    decimal TotalSpentThisMonth,
    decimal TotalCashbackEarned,
    decimal PotentialMissedCashback,
    List<SpendingInsightDto> SpendingBreakdown,
    List<CardRecommendationDto> CardRecommendations,
    List<SuggestedCardDto> SuggestedCards,
    List<BudgetStatusDto> BudgetStatuses
);

public record SuggestedCardDto(
    string CardName,
    string Bank,
    decimal AnnualFee,
    string WhyRecommended,
    string TopPerk
);
