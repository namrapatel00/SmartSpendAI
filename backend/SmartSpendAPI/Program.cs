using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartSpendAPI.Data;
using SmartSpendAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Services ────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// SQLite — free, no installation needed!
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite("Data Source=smartspend.db"));

// Our custom services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<RecommendationEngine>();
builder.Services.AddHttpClient<CardSearchService>();
builder.Services.AddScoped<CardSearchService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SmartSpendAI-SuperSecretKey-2024!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = "SmartSpendAPI",
            ValidAudience = "SmartSpendUI",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// CORS — allows React frontend to connect
builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAll", p => p
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader()));

var app = builder.Build();

// ─── Auto-create + migrate database on startup ────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // creates tables automatically
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
