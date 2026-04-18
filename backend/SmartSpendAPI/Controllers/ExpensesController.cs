using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartSpendAPI.Data;
using SmartSpendAPI.DTOs;
using SmartSpendAPI.Models;
using SmartSpendAPI.Services;

namespace SmartSpendAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuthService _auth;
    private readonly RecommendationEngine _engine;

    public ExpensesController(AppDbContext db, AuthService auth, RecommendationEngine engine)
    {
        _db = db;
        _auth = auth;
        _engine = engine;
    }

    // GET /api/expenses?month=4&year=2025
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? month, [FromQuery] int? year)
    {
        var userId = _auth.GetUserId(User);
        var query = _db.Expenses
            .Include(e => e.CreditCard)
            .Where(e => e.UserId == userId);

        if (month.HasValue) query = query.Where(e => e.Date.Month == month);
        if (year.HasValue)  query = query.Where(e => e.Date.Year == year);

        var cards = await _db.CreditCards.Where(c => c.UserId == userId).ToListAsync();
        var expenses = await query.OrderByDescending(e => e.Date).ToListAsync();

        var result = expenses.Select(e => new ExpenseResponseDto(
            Id: e.Id,
            Title: e.Title,
            Amount: e.Amount,
            Category: e.Category,
            CreditCardId: e.CreditCardId,
            CardName: e.CreditCard?.CardName,
            Date: e.Date,
            Notes: e.Notes,
            CashbackEarned: _engine.CalculateCashback(e, e.CreditCard)
        ));

        return Ok(result);
    }

    // POST /api/expenses
    [HttpPost]
    public async Task<IActionResult> Create(CreateExpenseDto dto)
    {
        var userId = _auth.GetUserId(User);

        var expense = new Expense
        {
            UserId = userId,
            Title = dto.Title,
            Amount = dto.Amount,
            Category = dto.Category,
            CreditCardId = dto.CreditCardId,
            Date = dto.Date,
            Notes = dto.Notes
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Expense added!", id = expense.Id });
    }

    // PUT /api/expenses/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateExpenseDto dto)
    {
        var userId = _auth.GetUserId(User);
        var expense = await _db.Expenses
            .Include(e => e.CreditCard)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (expense == null) return NotFound(new { message = "Expense not found." });

        expense.Title = dto.Title;
        expense.Amount = dto.Amount;
        expense.Category = dto.Category;
        expense.CreditCardId = dto.CreditCardId;
        expense.Date = dto.Date;
        expense.Notes = dto.Notes;

        await _db.SaveChangesAsync();

        CreditCard? card = null;
        if (expense.CreditCardId.HasValue)
        {
            card = await _db.CreditCards
                .FirstOrDefaultAsync(c => c.Id == expense.CreditCardId.Value && c.UserId == userId);
        }

        return Ok(new ExpenseResponseDto(
            Id: expense.Id,
            Title: expense.Title,
            Amount: expense.Amount,
            Category: expense.Category,
            CreditCardId: expense.CreditCardId,
            CardName: card?.CardName,
            Date: expense.Date,
            Notes: expense.Notes,
            CashbackEarned: _engine.CalculateCashback(expense, card)
        ));
    }

    // DELETE /api/expenses/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = _auth.GetUserId(User);
        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return NotFound();

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Deleted." });
    }

    // GET /api/expenses/categories
    [HttpGet("categories")]
    [AllowAnonymous]
    public IActionResult GetCategories() => Ok(Categories.All);
}
