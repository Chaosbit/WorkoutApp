using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WorkoutApp.Api.Data;
using WorkoutApp.Api.DTOs;
using WorkoutApp.Api.Models;
using Newtonsoft.Json;

namespace WorkoutApp.Tests;

public class AuthControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<WorkoutAppDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory database for testing
                services.AddDbContext<WorkoutAppDbContext>(options =>
                {
                    options.UseInMemory("TestDatabase_" + Guid.NewGuid());
                });
            });
        });
        
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task PostRegister_WithValidData_ShouldCreateUser()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<dynamic>(content);
        
        Assert.NotNull(result);
        Assert.Contains("Registration successful", result.message.ToString());
    }

    [Fact]
    public async Task PostRegister_WithDuplicateUsername_ShouldReturnBadRequest()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<WorkoutAppDbContext>();
        
        // Add a user first
        var existingUser = new User
        {
            Username = "existinguser",
            Email = "existing@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            IsApproved = true,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        context.Users.Add(existingUser);
        await context.SaveChangesAsync();

        var registerRequest = new RegisterRequest
        {
            Username = "existinguser", // Same username
            Email = "different@example.com",
            Password = "password123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostLogin_WithValidCredentials_ShouldReturnToken()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<WorkoutAppDbContext>();
        
        // Add an approved user
        var user = new User
        {
            Username = "loginuser",
            Email = "login@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            IsApproved = true,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var loginRequest = new LoginRequest
        {
            UsernameOrEmail = "loginuser",
            Password = "password123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<dynamic>(content);
        
        Assert.NotNull(result);
        Assert.NotNull(result.token);
        Assert.Equal("loginuser", result.user.username.ToString());
    }

    [Fact]
    public async Task PostLogin_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            UsernameOrEmail = "nonexistent",
            Password = "wrongpassword"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PostLogin_WithUnapprovedUser_ShouldReturnUnauthorized()
    {
        // Arrange
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<WorkoutAppDbContext>();
        
        // Add an unapproved user
        var user = new User
        {
            Username = "unapproveduser",
            Email = "unapproved@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            IsApproved = false, // Not approved
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var loginRequest = new LoginRequest
        {
            UsernameOrEmail = "unapproveduser",
            Password = "password123"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}