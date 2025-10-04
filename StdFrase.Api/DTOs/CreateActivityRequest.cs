namespace StdFrase.Api.DTOs;

public class CreateActivityRequest
{
    public string Name { get; set; } = default!;
    public string? MoId { get; set; }
    public int ActivityOrder { get; set; }
    public List<CreateFieldRequest>? Field { get; set; }
}
