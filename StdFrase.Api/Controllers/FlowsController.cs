using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StdFrase.Api.Data;
using StdFrase.Api.DTOs;

namespace StdFrase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FlowsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<FlowsController> _logger;

    public FlowsController(AppDbContext context, ILogger<FlowsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FlowDto>>> GetAll([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        _logger.LogInformation("Getting all flows");
        
        var query = _context.Flows
            .Include(f => f.Activities)
            .ThenInclude(a => a.Fields)
            .ThenInclude(f => f.Cuesta)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(f => f.Title.Contains(search) || (f.Sks != null && f.Sks.Contains(search)));
        }

        var flows = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(flows.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FlowDto>> GetById(Guid id)
    {
        _logger.LogInformation("Getting flow with id {Id}", id);
        
        var flow = await _context.Flows
            .Include(f => f.Activities)
            .ThenInclude(a => a.Fields)
            .ThenInclude(f => f.Cuesta)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (flow == null)
        {
            return NotFound();
        }

        return Ok(MapToDto(flow));
    }

    [HttpPost]
    public async Task<ActionResult<FlowDto>> Create([FromBody] CreateFlowRequest req)
    {
        _logger.LogInformation("Creating new flow");

        var flow = new Flow
        {
            Id = Guid.NewGuid(),
            Title = req.Title,
            Sks = req.Sks
        };

        foreach (var actReq in req.Activity)
        {
            var activity = new Activity
            {
                Id = Guid.NewGuid(),
                Name = actReq.Name,
                MoId = actReq.MoId
            };

            if (actReq.Field != null)
            {
                foreach (var fieldReq in actReq.Field)
                {
                    var cuesta = await GetOrCreateCuesta(fieldReq.CuestaId);
                    
                    activity.Fields.Add(new Field
                    {
                        Id = Guid.NewGuid(),
                        Cuesta = cuesta,
                        FieldOrder = fieldReq.FieldOrder,
                        FieldType = (FieldType)fieldReq.FieldType,
                        StandardPhrase = fieldReq.Standardphrase
                    });
                }
            }

            flow.Activities.Add(activity);
        }

        _context.Flows.Add(flow);
        await _context.SaveChangesAsync();

        var created = await _context.Flows
            .Include(f => f.Activities)
            .ThenInclude(a => a.Fields)
            .ThenInclude(f => f.Cuesta)
            .FirstAsync(f => f.Id == flow.Id);

        return CreatedAtAction(nameof(GetById), new { id = flow.Id }, MapToDto(created));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FlowDto>> Update(Guid id, [FromBody] CreateFlowRequest req)
    {
        _logger.LogInformation("Updating flow with id {Id}", id);

        var flow = await _context.Flows
            .Include(f => f.Activities)
            .ThenInclude(a => a.Fields)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (flow == null)
        {
            return NotFound();
        }

        flow.Title = req.Title;
        flow.Sks = req.Sks;

        // Remove all existing activities and fields
        _context.Activities.RemoveRange(flow.Activities);
        flow.Activities.Clear();

        // Add new activities and fields
        foreach (var actReq in req.Activity)
        {
            var activity = new Activity
            {
                Id = Guid.NewGuid(),
                Name = actReq.Name,
                MoId = actReq.MoId
            };

            if (actReq.Field != null)
            {
                foreach (var fieldReq in actReq.Field)
                {
                    var cuesta = await GetOrCreateCuesta(fieldReq.CuestaId);
                    
                    activity.Fields.Add(new Field
                    {
                        Id = Guid.NewGuid(),
                        Cuesta = cuesta,
                        FieldOrder = fieldReq.FieldOrder,
                        FieldType = (FieldType)fieldReq.FieldType,
                        StandardPhrase = fieldReq.Standardphrase
                    });
                }
            }

            flow.Activities.Add(activity);
        }

        await _context.SaveChangesAsync();

        var updated = await _context.Flows
            .Include(f => f.Activities)
            .ThenInclude(a => a.Fields)
            .ThenInclude(f => f.Cuesta)
            .FirstAsync(f => f.Id == id);

        return Ok(MapToDto(updated));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting flow with id {Id}", id);

        var flow = await _context.Flows.FindAsync(id);
        if (flow == null)
        {
            return NotFound();
        }

        _context.Flows.Remove(flow);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("export")]
    public async Task<ActionResult<IEnumerable<CreateFlowRequest>>> ExportBySks([FromQuery] string sks)
    {
        _logger.LogInformation("Exporting flows with SKS {Sks}", sks);

        if (string.IsNullOrWhiteSpace(sks))
        {
            return BadRequest("SKS parameter is required");
        }

        var flows = await _context.Flows
            .Include(f => f.Activities)
            .ThenInclude(a => a.Fields)
            .ThenInclude(f => f.Cuesta)
            .Where(f => f.Sks == sks)
            .ToListAsync();

        return Ok(flows.Select(MapToExportFormat));
    }

    [HttpGet("activities")]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetAllActivities([FromQuery] string? search = null)
    {
        _logger.LogInformation("Getting all unique activities");
        
        var query = _context.Activities
            .Include(a => a.Fields)
            .ThenInclude(f => f.Cuesta)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a => a.Name.Contains(search) || (a.MoId != null && a.MoId.Contains(search)));
        }

        var activities = await query.ToListAsync();

        // Get unique activities by name
        var uniqueActivities = activities
            .GroupBy(a => a.Name)
            .Select(g => g.First())
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                Name = a.Name,
                MoId = a.MoId,
                Fields = a.Fields.Select(f => new FieldDto
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
            });

        return Ok(uniqueActivities);
    }

    private async Task<Cuesta> GetOrCreateCuesta(string path)
    {
        var cuesta = await _context.Cuestas.FirstOrDefaultAsync(c => c.Path == path);
        if (cuesta == null)
        {
            cuesta = new Cuesta
            {
                Id = Guid.NewGuid(),
                Path = path
            };
            _context.Cuestas.Add(cuesta);
        }
        return cuesta;
    }

    private static FlowDto MapToDto(Flow flow)
    {
        return new FlowDto
        {
            Id = flow.Id,
            Title = flow.Title,
            Sks = flow.Sks,
            Activities = flow.Activities.Select(a => new ActivityDto
            {
                Id = a.Id,
                Name = a.Name,
                MoId = a.MoId,
                Fields = a.Fields.Select(f => new FieldDto
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

    private static CreateFlowRequest MapToExportFormat(Flow flow)
    {
        return new CreateFlowRequest
        {
            Title = flow.Title,
            Sks = flow.Sks,
            Activity = flow.Activities.Select(a => new CreateActivityRequest
            {
                Name = a.Name,
                MoId = a.MoId,
                Field = a.Fields.Any() ? a.Fields.Select(f => new CreateFieldRequest
                {
                    CuestaId = f.Cuesta.Path,
                    FieldOrder = f.FieldOrder,
                    FieldType = (int)f.FieldType,
                    Standardphrase = f.StandardPhrase
                }).ToList() : null
            }).ToList()
        };
    }
}
