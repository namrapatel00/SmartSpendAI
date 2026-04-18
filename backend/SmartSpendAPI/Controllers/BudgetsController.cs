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
public class BudgetsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuthService _auth;

    public BudgetsController(AppDbContext db, AuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    // GET /api/budgets?month=4&year=2025
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? month, [FromQuery] int? year)
    {
        var userId = _auth.GetUserId(User);
        var now = DateTime.UtcNow;
        var m = month ?? now.Month;
        var y = year ?? now.Year;

        var budgets = await _db.Budgets
            .Where(b => b.UserId == userId && b.Month == m && b.Year == y)
            .ToListAsync();

        var expenses = await _db.Expenses
            .Where(e => e.UserId == userId && e.Date.Month == m && e.Date.Year == y)
            .ToListAsync();

        var result = budgets.Select(b =>
        {
            var spent = expenses.Where(e => e.Category == b.Category).Sum(e => e.Amount);
            return new BudgetStatusDto(
                Id: b.Id,
                Category: b.Category,
                MonthlyLimit: b.MonthlyLimit,
                AmountSpent: spent,
                Remaining: b.MonthlyLimit - spent,
                IsOverBudget: spent > b.MonthlyLimit,
                Month: b.Month,
                Year: b.Year
            );
        });

        return Ok(result);
    }

    // POST /api/budgets
    [HttpPost]
    public async Task<IActionResult> Create(CreateBudgetDto dto)
    {
        var userId = _auth.GetUserId(User);

        // Replace existing budget for same category/month/year
        var existing = await _db.Budgets.FirstOrDefaultAsync(b =>
            b.UserId == userId &&
            b.Category == dto.Category &&
            b.Month == dto.Month &&
            b.Year == dto.Year);

        if (existing != null)
        {
            existing.MonthlyLimit = dto.MonthlyLimit;
        }
        else
        {
            _db.Budgets.Add(new Budget
            {
                UserId = userId,
                Category = dto.Category,
                MonthlyLimit = dto.MonthlyLimit,
                Month = dto.Month,
                Year = dto.Year
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Budget saved!" });
    }

    // DELETE /api/budgets/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = _auth.GetUserId(User);
        var budget = await _db.Budgets.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null) return NotFound();

        _db.Budgets.Remove(budget);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Budget deleted." });
    }
}
