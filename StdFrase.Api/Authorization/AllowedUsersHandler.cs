using Microsoft.AspNetCore.Authorization;

namespace StdFrase.Api.Authorization;

public class AllowedUsersHandler : AuthorizationHandler<AllowedUsersRequirement>
{
    private readonly ILogger<AllowedUsersHandler> _logger;

    public AllowedUsersHandler(ILogger<AllowedUsersHandler> logger)
    {
        _logger = logger;
    }

    protected override Task HandleRequirementAsync(
           AuthorizationHandlerContext context,
           AllowedUsersRequirement requirement)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            _logger.LogWarning("User is not authenticated");
            context.Fail(); // Explicitly fail the authorization
            return Task.CompletedTask;
        }

        var userName = context.User.Identity.Name;
        _logger.LogInformation("Checking authorization for user: {UserName}", userName);

        if (string.IsNullOrEmpty(userName))
        {
            _logger.LogWarning("User name is null or empty");
            context.Fail(); // Explicitly fail the authorization
            return Task.CompletedTask;
        }

        // Check if user is in allowed list (case-insensitive comparison)
        if (requirement.AllowedUsers.Any(u =>
            string.Equals(u, userName, StringComparison.OrdinalIgnoreCase)))
        {
            _logger.LogInformation("User {UserName} is authorized", userName);
            context.Succeed(requirement);
        }
        else
        {
            _logger.LogWarning("User {UserName} is not in the allowed users list", userName);
            context.Fail(); // Explicitly fail the authorization
        }

        return Task.CompletedTask;
    }
}