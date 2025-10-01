namespace StdFrase.Api.Data;

public class Flow
{
    public Guid Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Sks { get; set; }
    public List<Activity> Activities { get; set; } = new();
}
