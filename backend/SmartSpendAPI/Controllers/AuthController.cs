using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using SmartSpendAPI.Data;
using SmartSpendAPI.DTOs;
using SmartSpendAPI.Models;
using SmartSpendAPI.Services;

namespace SmartSpendAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AuthService _auth;

    public AuthController(AppDbContext db, AuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    // GET /api/auth/me
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = _auth.GetUserId(User);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new UserProfileDto(
            user.Name,
            user.Email,
            user.MonthlyIncome,
            user.CreditScore,
            user.CreatedAt
        ));
    }

    // PUT /api/auth/me
    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateUserProfileDto dto)
    {
        var userId = _auth.GetUserId(User);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "User not found." });

        user.MonthlyIncome = dto.MonthlyIncome;
        user.CreditScore = dto.CreditScore;

        await _db.SaveChangesAsync();

        return Ok(new UserProfileDto(
            user.Name,
            user.Email,
            user.MonthlyIncome,
            user.CreditScore,
            user.CreatedAt
        ));
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already registered." });

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            MonthlyIncome = dto.MonthlyIncome,
            CreditScore = dto.CreditScore
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _auth.GenerateToken(user);
        return Ok(new AuthResponseDto(token, user.Name, user.Id));
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        var token = _auth.GenerateToken(user);
        return Ok(new AuthResponseDto(token, user.Name, user.Id));
    }
}
