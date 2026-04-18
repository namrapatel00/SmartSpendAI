using SmartSpendAPI.Models;
using SmartSpendAPI.DTOs;

namespace SmartSpendAPI.Services;

/// <summary>
/// Rule-based recommendation engine — zero external APIs, works 100% offline.
/// This is the "brain" of SmartSpend AI.
/// </summary>
public class RecommendationEngine
{
    // ─── Get best card for a category ────────────────────────────────────────
    public CardRecommendationDto? GetBestCard(string category, List<CreditCard> userCards)
    {
        if (!userCards.Any()) return null;

        var ranked = userCards
            .Select(c => new { Card = c, Cashback = GetCashbackForCategory(c, category) })
            .OrderByDescending(x => x.Cashback)
            .ToList();

        var best = ranked.First();

        return new CardRecommendationDto(
            Category: category,
            BestCardId: best.Card.Id,
            BestCardName: best.Card.CardName,
            BestCardBank: best.Card.Bank,
            BestCashbackPercent: best.Cashback,
            Reason: $"Highest {category} cashback at {best.Cashback}%"
        );
    }

    // ─── Get all category recommendations ────────────────────────────────────
    public List<CardRecommendationDto> GetAllRecommendations(List<CreditCard> userCards)
    {
        var results = new List<CardRecommendationDto>();
        foreach (var cat in Categories.All)
        {
            var rec = GetBestCard(cat, userCards);
            if (rec != null) results.Add(rec);
        }
        return results;
    }

    // ─── Analyze spending & produce insights ─────────────────────────────────
    public List<SpendingInsightDto> AnalyzeSpending(List<Expense> expenses)
    {
        if (!expenses.Any()) return new List<SpendingInsightDto>();

        var total = expenses.Sum(e => e.Amount);
        var byCategory = expenses
            .GroupBy(e => e.Category)
            .Select(g => new
            {
                Category = g.Key,
                Spent = g.Sum(e => e.Amount),
                Pct = Math.Round(g.Sum(e => e.Amount) / total * 100, 1)
            })
            .OrderByDescending(x => x.Spent)
            .ToList();

        return byCategory.Select(c => new SpendingInsightDto(
            Category: c.Category,
            TotalSpent: c.Spent,
            Percentage: c.Pct,
            Insight: GenerateInsight(c.Category, c.Spent, c.Pct)
        )).ToList();
    }

    // ─── Calculate cashback earned on a specific expense ─────────────────────
    public decimal CalculateCashback(Expense expense, CreditCard? card)
    {
        if (card == null) return 0;
        var pct = GetCashbackForCategory(card, expense.Category);
        return Math.Round(expense.Amount * pct / 100, 2);
    }

    // ─── Calculate missed cashback (if user used non-optimal card) ────────────
    public decimal CalculateMissedCashback(List<Expense> expenses, List<CreditCard> userCards)
    {
        decimal missed = 0;
        foreach (var expense in expenses)
        {
            var usedCard = userCards.FirstOrDefault(c => c.Id == expense.CreditCardId);
            var bestCard = userCards
                .OrderByDescending(c => GetCashbackForCategory(c, expense.Category))
                .FirstOrDefault();

            if (bestCard == null) continue;

            var bestCashback = expense.Amount * GetCashbackForCategory(bestCard, expense.Category) / 100;
            var usedCashback = usedCard != null
                ? expense.Amount * GetCashbackForCategory(usedCard, expense.Category) / 100
                : 0;

            missed += Math.Max(0, bestCashback - usedCashback);
        }
        return Math.Round(missed, 2);
    }

    // ─── Suggest new cards based on credit score + spending habits ────────────
    public List<SuggestedCardDto> SuggestNewCards(int creditScore, List<SpendingInsightDto> spending)
    {
        var topCategory = spending.FirstOrDefault()?.Category ?? "Other";
        var suggestions = new List<SuggestedCardDto>();

        // Rule-based card suggestions — no API, no cost!
        var cardDatabase = new List<(string Name, string Bank, int MinScore, decimal Fee, string Perk, string Category)>
        {
            ("Chase Sapphire Preferred", "Chase", 700, 95, "3x on dining, 2x on travel", "Food"),
            ("Chase Freedom Flex",       "Chase", 670, 0, "5% rotating categories and 5% Chase Travel", "Shopping"),
            ("Discover It Cash Back",    "Discover", 640, 0, "5% rotating categories, no annual fee", "Shopping"),
            ("Chase Freedom Unlimited",  "Chase", 670, 0, "1.5% on everything, 3% on dining", "Food"),
            ("Capital One Quicksilver",  "Capital One", 620, 0, "1.5% flat on all purchases", "Other"),
            ("Capital One Savor",        "Capital One", 690, 0, "3% on dining, grocery, streaming and entertainment", "Entertainment"),
            ("Amex Blue Cash Preferred", "Amex", 700, 95, "6% on groceries, 3% on gas", "Food"),
            ("Amex Blue Cash Everyday",  "Amex", 670, 0, "3% groceries, gas and online retail", "Shopping"),
            ("Citi Double Cash",         "Citi", 680, 0, "2% on everything — 1% buy + 1% pay", "Other"),
            ("Wells Fargo Active Cash",  "Wells Fargo", 670, 0, "2% cash rewards on purchases", "Other"),
            ("Capital One Venture",      "Capital One", 700, 95, "2x miles on all purchases", "Travel"),
            ("Bank of America Travel",   "BofA", 660, 95, "1.5x points on all travel", "Travel"),
            ("Secured Discover It",      "Discover", 300, 0, "Build credit with cashback rewards", "Other"),
        };

        foreach (var card in cardDatabase)
        {
            if (card.MinScore <= creditScore)
            {
                var reason = card.Category == topCategory
                    ? $"Matches your top spending category ({topCategory})"
                    : card.Fee == 0
                        ? "No annual fee — great starter card"
                        : $"Strong rewards for {card.Category} spending";

                suggestions.Add(new SuggestedCardDto(card.Name, card.Bank, card.Fee, reason, card.Perk));
            }
        }

        // Return a broader set of relevant suggestions
        return suggestions
            .OrderByDescending(s => s.WhyRecommended.Contains(topCategory))
            .ThenBy(s => s.AnnualFee)
            .Take(5)
            .ToList();
    }

    // ─── Helper: extract cashback % for a category from a card ───────────────
    private decimal GetCashbackForCategory(CreditCard card, string category) => category switch
    {
        "Food"          => card.FoodCashback,
        "Travel"        => card.TravelCashback,
        "Bills"         => card.BillsCashback,
        "Shopping"      => card.ShoppingCashback,
        "Entertainment" => card.EntertainmentCashback,
        _               => card.OtherCashback
    };

    // ─── Helper: generate human-readable insight ──────────────────────────────
    private string GenerateInsight(string category, decimal spent, decimal pct) => category switch
    {
        "Food" when pct > 30      => $"You spend {pct}% on Food (${spent:F0}/mo). A dining rewards card could save you ${spent * 0.04m:F0}/year.",
        "Travel" when pct > 20    => $"Travel is {pct}% of your spending. A travel rewards card could earn 3-5x points.",
        "Shopping" when pct > 25  => $"Shopping is {pct}% of budget. Look for a card with 5% shopping cashback.",
        "Bills" when pct > 20     => $"Bills eat {pct}% of your budget. Auto-pay with a cashback card saves passively.",
        "Entertainment" when pct > 15 => $"Entertainment is {pct}% of spending. Could you trim ${spent * 0.2m:F0}/mo here?",
        _ => $"{category}: ${spent:F0}/mo ({pct}% of total spending)"
    };
}
