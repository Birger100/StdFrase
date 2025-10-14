using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StdFrase.Api.Data;
using StdFrase.Api.DTOs;

namespace StdFrase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AllowedUsersPolicy")]
public class CuestasController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<CuestasController> _logger;

    public CuestasController(AppDbContext context, ILogger<CuestasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CuestaDto>>> GetAll([FromQuery] string? search = null)
    {
        _logger.LogInformation("Getting all cuestas");
        
        var query = _context.Cuestas.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Path.Contains(search));
        }

        var cuestas = await query.ToListAsync();

        return Ok(cuestas.Select(c => new CuestaDto
        {
            Id = c.Id,
            Path = c.Path
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CuestaDto>> GetById(Guid id)
    {
        _logger.LogInformation("Getting cuesta with id {Id}", id);
        
        var cuesta = await _context.Cuestas.FindAsync(id);

        if (cuesta == null)
        {
            return NotFound();
        }

        return Ok(new CuestaDto
        {
            Id = cuesta.Id,
            Path = cuesta.Path
        });
    }

    [HttpPost]
    public async Task<ActionResult<CuestaDto>> Create([FromBody] CreateCuestaRequest req)
    {
        _logger.LogInformation("Creating new cuesta");

        // Check if path already exists
        var existing = await _context.Cuestas.FirstOrDefaultAsync(c => c.Path == req.Path);
        if (existing != null)
        {
            return Conflict("A cuesta with this path already exists");
        }

        var cuesta = new Cuesta
        {
            Id = Guid.NewGuid(),
            Path = req.Path
        };

        _context.Cuestas.Add(cuesta);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cuesta.Id }, new CuestaDto
        {
            Id = cuesta.Id,
            Path = cuesta.Path
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CuestaDto>> Update(Guid id, [FromBody] UpdateCuestaRequest req)
    {
        _logger.LogInformation("Updating cuesta with id {Id}", id);

        var cuesta = await _context.Cuestas.FindAsync(id);
        if (cuesta == null)
        {
            return NotFound();
        }

        // Check if the new path already exists for a different cuesta
        var existing = await _context.Cuestas.FirstOrDefaultAsync(c => c.Path == req.Path && c.Id != id);
        if (existing != null)
        {
            return Conflict("A cuesta with this path already exists");
        }

        cuesta.Path = req.Path;
        await _context.SaveChangesAsync();

        return Ok(new CuestaDto
        {
            Id = cuesta.Id,
            Path = cuesta.Path
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting cuesta with id {Id}", id);

        var cuesta = await _context.Cuestas.FindAsync(id);
        if (cuesta == null)
        {
            return NotFound();
        }

        // Check if cuesta is referenced by any fields
        var isReferenced = await _context.Fields.AnyAsync(f => f.CuestaId == id);
        if (isReferenced)
        {
            return Conflict("Cannot delete cuesta because it is referenced by one or more fields");
        }

        _context.Cuestas.Remove(cuesta);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
