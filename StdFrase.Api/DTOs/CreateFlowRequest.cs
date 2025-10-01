namespace StdFrase.Api.DTOs;

public class CreateFlowRequest
{
    public string Title { get; set; } = default!;
    public string? Sks { get; set; }
    public List<CreateActivityRequest> Activity { get; set; } = new();
}
