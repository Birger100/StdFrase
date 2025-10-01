namespace StdFrase.Api.Data;

public class Field
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public Activity Activity { get; set; } = default!;
    public Guid CuestaId { get; set; }
    public Cuesta Cuesta { get; set; } = default!;
    public int FieldOrder { get; set; }
    public FieldType FieldType { get; set; }
    public string? StandardPhrase { get; set; }
}
