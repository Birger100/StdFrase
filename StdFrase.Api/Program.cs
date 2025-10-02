using Microsoft.EntityFrameworkCore;
using StdFrase.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register DbContext - Use SQLite in development, SQL Server in production
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Register repositories and services
builder.Services.AddSwaggerGen();     // from Swashbuckle

// Configure CORS for React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://sfweb.test.it.rn.dk")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.

app.MapOpenApi();
app.UseSwagger();    // JSON at /swagger/v1/swagger.json

app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();