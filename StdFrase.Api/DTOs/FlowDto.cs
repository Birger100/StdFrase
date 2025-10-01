namespace StdFrase.Api.DTOs;

public class FlowDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Sks { get; set; }
    public List<ActivityDto> Activities { get; set; } = new();
}
