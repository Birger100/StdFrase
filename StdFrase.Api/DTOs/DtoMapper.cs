using StdFrase.Api.Data;

namespace StdFrase.Api.DTOs
{
    public static class DtoMapper
    {
        public static FlowDto MapToDto(Flow flow)
        {
            return new FlowDto
            {
                Id = flow.Id,
                Title = flow.Title,
                Sks = flow.Sks,
                Activities = flow.Activities
                    .OrderBy(a => a.ActivityOrder) // Order activities by ActivityOrder
                    .Select(a => new ActivityDto
                    {
                        Id = a.Id,
                        Name = a.Name,
                        MoId = a.MoId,
                        ActivityOrder = a.ActivityOrder,
                        Fields = a.Fields
                            .OrderBy(f => f.FieldOrder) // Order fields by FieldOrder
                            .Select(f => new FieldDto
                            {
                                Id = f.Id,
                                FieldOrder = f.FieldOrder,
                                FieldType = (int)f.FieldType,
                                StandardPhrase = f.StandardPhrase,
                                Cuesta = new CuestaDto
                                {
                                    Id = f.Cuesta.Id,
                                    Path = f.Cuesta.Path
                                }
                            }).ToList()
                    }).ToList()
            };
        }
    }
}