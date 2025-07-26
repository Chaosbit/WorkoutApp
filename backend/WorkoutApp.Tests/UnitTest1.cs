using Microsoft.EntityFrameworkCore;
using WorkoutApp.Api.Data;
using WorkoutApp.Api.Models;
using WorkoutApp.Api.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace WorkoutApp.Tests;

public class AuthServiceTests
{
    private WorkoutAppDbContext GetInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<WorkoutAppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        return new WorkoutAppDbContext(options);
    }

    private IConfiguration GetMockConfiguration()
    {
        var mockConfig = new Mock<IConfiguration>();
        var mockJwtSection = new Mock<IConfigurationSection>();
        
        mockJwtSection.Setup(x => x["SecretKey"]).Returns("YourSuperSecretKeyThatIsAtLeast32CharactersLong");
        mockJwtSection.Setup(x => x["Issuer"]).Returns("WorkoutApp");
        mockJwtSection.Setup(x => x["Audience"]).Returns("WorkoutApp");
        
        mockConfig.Setup(x => x.GetSection("JwtSettings")).Returns(mockJwtSection.Object);
        
        return mockConfig.Object;
    }

    [Fact]
    public void HashPassword_ShouldHashPassword()
    {
        // Arrange
        using var context = GetInMemoryContext();
        var configuration = GetMockConfiguration();
        var authService = new AuthService(context, configuration);
        
        var password = "plainpassword";

        // Act
        var hashedPassword = authService.HashPassword(password);

        // Assert
        Assert.NotNull(hashedPassword);
        Assert.NotEqual(password, hashedPassword);
        Assert.True(BCrypt.Net.BCrypt.Verify(password, hashedPassword));
    }

    [Fact]
    public void VerifyPassword_ShouldReturnTrue_WhenPasswordMatches()
    {
        // Arrange
        using var context = GetInMemoryContext();
        var configuration = GetMockConfiguration();
        var authService = new AuthService(context, configuration);
        
        var password = "plainpassword";
        var hashedPassword = authService.HashPassword(password);

        // Act
        var result = authService.VerifyPassword(password, hashedPassword);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalse_WhenPasswordDoesNotMatch()
    {
        // Arrange
        using var context = GetInMemoryContext();
        var configuration = GetMockConfiguration();
        var authService = new AuthService(context, configuration);
        
        var password = "plainpassword";
        var wrongPassword = "wrongpassword";
        var hashedPassword = authService.HashPassword(password);

        // Act
        var result = authService.VerifyPassword(wrongPassword, hashedPassword);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void GenerateJwtToken_ShouldGenerateValidToken()
    {
        // Arrange
        using var context = GetInMemoryContext();
        var configuration = GetMockConfiguration();
        var authService = new AuthService(context, configuration);
        
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = authService.HashPassword("password"),
            IsApproved = true,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        // Act
        var token = authService.GenerateJwtToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        
        // Basic JWT structure check (three parts separated by dots)
        var parts = token.Split('.');
        Assert.Equal(3, parts.Length);
    }
}