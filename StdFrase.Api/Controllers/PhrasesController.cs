using Microsoft.AspNetCore.Mvc;
using StdFrase.Api.Models;
using StdFrase.Api.Services;

namespace StdFrase.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhrasesController : ControllerBase
{
    private readonly IPhraseService _phraseService;
    private readonly ILogger<PhrasesController> _logger;

    public PhrasesController(IPhraseService phraseService, ILogger<PhrasesController> logger)
    {
        _phraseService = phraseService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Phrase>>> GetAll()
    {
        _logger.LogInformation("Getting all phrases");
        var phrases = await _phraseService.GetAllPhrasesAsync();
        return Ok(phrases);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Phrase>> GetById(int id)
    {
        _logger.LogInformation("Getting phrase with id {Id}", id);
        var phrase = await _phraseService.GetPhraseByIdAsync(id);
        
        if (phrase == null)
        {
            return NotFound();
        }

        return Ok(phrase);
    }

    [HttpPost]
    public async Task<ActionResult<Phrase>> Create([FromBody] Phrase phrase)
    {
        _logger.LogInformation("Creating new phrase");
        var createdPhrase = await _phraseService.CreatePhraseAsync(phrase);
        return CreatedAtAction(nameof(GetById), new { id = createdPhrase.Id }, createdPhrase);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Phrase>> Update(int id, [FromBody] Phrase phrase)
    {
        _logger.LogInformation("Updating phrase with id {Id}", id);
        var updatedPhrase = await _phraseService.UpdatePhraseAsync(id, phrase);
        
        if (updatedPhrase == null)
        {
            return NotFound();
        }

        return Ok(updatedPhrase);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        _logger.LogInformation("Deleting phrase with id {Id}", id);
        var result = await _phraseService.DeletePhraseAsync(id);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}
