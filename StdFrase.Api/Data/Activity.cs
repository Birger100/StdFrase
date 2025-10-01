namespace StdFrase.Api.Data;

public class Activity
{
    public Guid Id { get; set; }
    public Guid FlowId { get; set; }
    public Flow Flow { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? MoId { get; set; }
    public List<Field> Fields { get; set; } = new();
}
