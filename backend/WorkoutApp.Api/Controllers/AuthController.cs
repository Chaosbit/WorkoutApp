using Microsoft.AspNetCore.Mvc;
using WorkoutApp.Api.DTOs;
using WorkoutApp.Api.Services;

namespace WorkoutApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            if (result == null)
            {
                return BadRequest(new { message = "Username or email already exists" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Registration failed", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (result.RequiresApproval)
            {
                return Ok(new { message = "Account pending approval", requiresApproval = true });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Login failed", error = ex.Message });
        }
    }
}