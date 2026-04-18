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
public class CardsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuthService _auth;
    private readonly CardSearchService _search;

    public CardsController(AppDbContext db, AuthService auth, CardSearchService search)
    {
        _db = db;
        _auth = auth;
        _search = search;
    }

    // GET /api/cards
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = _auth.GetUserId(User);
        var cards = await _db.CreditCards
            .Where(c => c.UserId == userId && c.IsActive)
            .ToListAsync();

        return Ok(cards.Select(ToDto));
    }

    // GET /api/cards/search?q=...
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(Array.Empty<CardSearchResultDto>());

        try
        {
            var results = await _search.SearchAsync(q, cancellationToken);
            return Ok(results);
        }
        catch
        {
            return Ok(Array.Empty<CardSearchResultDto>());
        }
    }

    // POST /api/cards
    [HttpPost]
    public async Task<IActionResult> Create(CreateCardDto dto)
    {
        var userId = _auth.GetUserId(User);

        var card = new CreditCard
        {
            UserId = userId,
            CardName = dto.CardName,
            Bank = dto.Bank,
            Last4Digits = dto.Last4Digits,
            FoodCashback = dto.FoodCashback,
            TravelCashback = dto.TravelCashback,
            BillsCashback = dto.BillsCashback,
            ShoppingCashback = dto.ShoppingCashback,
            EntertainmentCashback = dto.EntertainmentCashback,
            OtherCashback = dto.OtherCashback,
            AnnualFee = dto.AnnualFee
        };

        _db.CreditCards.Add(card);
        await _db.SaveChangesAsync();

        return Ok(ToDto(card));
    }

    // DELETE /api/cards/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = _auth.GetUserId(User);
        var card = await _db.CreditCards.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (card == null) return NotFound();

        card.IsActive = false; // soft delete
        await _db.SaveChangesAsync();
        return Ok(new { message = "Card removed." });
    }

    private static CardResponseDto ToDto(CreditCard c) => new(
        c.Id, c.CardName, c.Bank, c.Last4Digits,
        c.FoodCashback, c.TravelCashback, c.BillsCashback,
        c.ShoppingCashback, c.EntertainmentCashback, c.OtherCashback, c.AnnualFee
    );
}
