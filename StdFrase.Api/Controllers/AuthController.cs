using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace StdFrase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;

    public AuthController(ILogger<AuthController> logger)
    {
        _logger = logger;
    }

    [HttpGet("user")]
    public ActionResult<object> GetCurrentUser()
    {
        var isAuthenticated = User?.Identity?.IsAuthenticated ?? false;
        var userName = User?.Identity?.Name;

        _logger.LogInformation("User info requested. Authenticated: {IsAuthenticated}, UserName: {UserName}", 
            isAuthenticated, userName);

        return Ok(new
        {
            isAuthenticated,
            userName,
            isAuthorized = isAuthenticated && !string.IsNullOrEmpty(userName)
        });
    }

    [HttpGet("check")]
    [Authorize(Policy = "AllowedUsersPolicy")]
    public ActionResult CheckAccess()
    {
        _logger.LogInformation("Access check passed for user: {UserName}", User?.Identity?.Name);
        return Ok(new { hasAccess = true, userName = User?.Identity?.Name });
    }
}
