using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartSpendAPI.Data;
using SmartSpendAPI.DTOs;
using SmartSpendAPI.Services;

namespace SmartSpendAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuthService _auth;
    private readonly RecommendationEngine _engine;

    public DashboardController(AppDbContext db, AuthService auth, RecommendationEngine engine)
    {
        _db = db;
        _auth = auth;
        _engine = engine;
    }

    // GET /api/dashboard — full dashboard data
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = _auth.GetUserId(User);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var now = DateTime.UtcNow;

        // Load data
        var cards = await _db.CreditCards
            .Where(c => c.UserId == userId && c.IsActive)
            .ToListAsync();

        var thisMonthExpenses = await _db.Expenses
            .Include(e => e.CreditCard)
            .Where(e => e.UserId == userId && e.Date.Month == now.Month && e.Date.Year == now.Year)
            .ToListAsync();

        var budgets = await _db.Budgets
            .Where(b => b.UserId == userId && b.Month == now.Month && b.Year == now.Year)
            .ToListAsync();

        // Compute values
        var monthlyIncome = user.MonthlyIncome;
        var totalSpent = thisMonthExpenses.Sum(e => e.Amount);
        var remainingSalary = monthlyIncome - totalSpent;
        var cashbackEarned = thisMonthExpenses.Sum(e => _engine.CalculateCashback(e, e.CreditCard));
        var missedCashback = _engine.CalculateMissedCashback(thisMonthExpenses, cards);
        var spending = _engine.AnalyzeSpending(thisMonthExpenses);
        var recommendations = _engine.GetAllRecommendations(cards);
        var suggestedCards = _engine.SuggestNewCards(user.CreditScore, spending);

        var budgetStatuses = budgets.Select(b =>
        {
            var spent = thisMonthExpenses.Where(e => e.Category == b.Category).Sum(e => e.Amount);
            return new BudgetStatusDto(b.Id, b.Category, b.MonthlyLimit, spent,
                b.MonthlyLimit - spent, spent > b.MonthlyLimit, b.Month, b.Year);
        }).ToList();

        return Ok(new DashboardDto(
            MonthlyIncome: monthlyIncome,
            RemainingSalaryThisMonth: remainingSalary,
            TotalSpentThisMonth: totalSpent,
            TotalCashbackEarned: cashbackEarned,
            PotentialMissedCashback: missedCashback,
            SpendingBreakdown: spending,
            CardRecommendations: recommendations,
            SuggestedCards: suggestedCards,
            BudgetStatuses: budgetStatuses
        ));
    }

    // GET /api/dashboard/recommend/{category} — quick per-category card recommendation
    [HttpGet("recommend/{category}")]
    public async Task<IActionResult> RecommendForCategory(string category)
    {
        var userId = _auth.GetUserId(User);
        var cards = await _db.CreditCards
            .Where(c => c.UserId == userId && c.IsActive)
            .ToListAsync();

        var rec = _engine.GetBestCard(category, cards);
        if (rec == null) return Ok(new { message = "No cards found. Add a credit card first!" });
        return Ok(rec);
    }
}
