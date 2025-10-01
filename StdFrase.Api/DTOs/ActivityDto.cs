namespace StdFrase.Api.DTOs;

public class ActivityDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? MoId { get; set; }
    public List<FieldDto> Fields { get; set; } = new();
}
