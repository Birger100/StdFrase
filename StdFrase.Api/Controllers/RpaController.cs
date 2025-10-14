using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StdFrase.Api.Authenticators;
using StdFrase.Api.Data;
using StdFrase.Api.DTOs;

namespace StdFrase.Api.Controllers
{
    [ApiKey]
    [Route("api/[controller]")]
    public class RpaController : Controller
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FlowsController> _logger;

        public RpaController(AppDbContext context, ILogger<FlowsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FlowDto>>> GetAll([FromQuery] string? search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            _logger.LogInformation("Getting all flows");

            var query = _context.Flows
                .Include(f => f.Activities)
                .ThenInclude(a => a.Fields)
                .ThenInclude(f => f.Cuesta)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                if (search.Length == 8) //only output on 8 char
                {
                    query = query.Where(f => (f.Sks != null && f.Sks.Contains(search)));
                }
                else
                {
                    query = query.Where(f => (f.Sks != null && f.Sks == search));
                }
            }

            var flows = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(flows.Select(DtoMapper.MapToDto));
        }
    }
}