namespace StdFrase.Api.DTOs;

public class FieldDto
{
    public Guid Id { get; set; }
    public int FieldOrder { get; set; }
    public int FieldType { get; set; }
    public string? StandardPhrase { get; set; }
    public CuestaDto Cuesta { get; set; } = default!;
}
