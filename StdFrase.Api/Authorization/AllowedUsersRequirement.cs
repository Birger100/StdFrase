using Microsoft.AspNetCore.Authorization;

namespace StdFrase.Api.Authorization;

public class AllowedUsersRequirement : IAuthorizationRequirement
{
    public List<string> AllowedUsers { get; }

    public AllowedUsersRequirement(List<string> allowedUsers)
    {
        AllowedUsers = allowedUsers ?? new List<string>();
    }
}
