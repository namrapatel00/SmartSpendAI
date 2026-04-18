using Microsoft.EntityFrameworkCore;
using SmartSpendAPI.Models;

namespace SmartSpendAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<CreditCard> CreditCards => Set<CreditCard>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Seed sample credit cards (no API needed - all built-in logic)
        modelBuilder.Entity<CreditCard>().HasData(
            new CreditCard
            {
                Id = -1, UserId = null,
                CardName = "Chase Freedom Flex",
                Bank = "Chase",
                Last4Digits = "0000",
                FoodCashback = 3.0m,
                TravelCashback = 5.0m,
                BillsCashback = 1.0m,
                ShoppingCashback = 5.0m,
                EntertainmentCashback = 1.0m,
                OtherCashback = 1.0m,
                AnnualFee = 0,
                MinCreditScore = 670
            },
            new CreditCard
            {
                Id = -2, UserId = null,
                CardName = "Discover It Cash Back",
                Bank = "Discover",
                Last4Digits = "0000",
                FoodCashback = 5.0m,
                TravelCashback = 1.0m,
                BillsCashback = 1.0m,
                ShoppingCashback = 5.0m,
                EntertainmentCashback = 1.0m,
                OtherCashback = 1.0m,
                AnnualFee = 0,
                MinCreditScore = 640
            },
            new CreditCard
            {
                Id = -3, UserId = null,
                CardName = "Capital One Quicksilver",
                Bank = "Capital One",
                Last4Digits = "0000",
                FoodCashback = 1.5m,
                TravelCashback = 1.5m,
                BillsCashback = 1.5m,
                ShoppingCashback = 1.5m,
                EntertainmentCashback = 1.5m,
                OtherCashback = 1.5m,
                AnnualFee = 0,
                MinCreditScore = 620
            }
        );
    }
}
