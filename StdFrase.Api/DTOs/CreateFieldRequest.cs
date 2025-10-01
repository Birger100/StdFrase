namespace StdFrase.Api.DTOs;

public class CreateFieldRequest
{
    public string CuestaId { get; set; } = default!; // This is the path string
    public int FieldOrder { get; set; }
    public int FieldType { get; set; }
    public string? Standardphrase { get; set; }
}
