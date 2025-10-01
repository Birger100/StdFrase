using StdFrase.Api.Models;

namespace StdFrase.Api.Repositories;

public class PhraseRepository : IPhraseRepository
{
    private readonly List<Phrase> _phrases = new();
    private int _nextId = 1;

    public PhraseRepository()
    {
        // Seed with some initial data
        _phrases.Add(new Phrase
        {
            Id = _nextId++,
            Text = "Hello, World!",
            Category = "Greeting",
            CreatedAt = DateTime.UtcNow
        });
        _phrases.Add(new Phrase
        {
            Id = _nextId++,
            Text = "Good morning!",
            Category = "Greeting",
            CreatedAt = DateTime.UtcNow
        });
    }

    public Task<IEnumerable<Phrase>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Phrase>>(_phrases);
    }

    public Task<Phrase?> GetByIdAsync(int id)
    {
        var phrase = _phrases.FirstOrDefault(p => p.Id == id);
        return Task.FromResult(phrase);
    }

    public Task<Phrase> AddAsync(Phrase phrase)
    {
        phrase.Id = _nextId++;
        phrase.CreatedAt = DateTime.UtcNow;
        _phrases.Add(phrase);
        return Task.FromResult(phrase);
    }

    public Task<Phrase> UpdateAsync(Phrase phrase)
    {
        var existing = _phrases.FirstOrDefault(p => p.Id == phrase.Id);
        if (existing != null)
        {
            existing.Text = phrase.Text;
            existing.Category = phrase.Category;
            existing.UpdatedAt = DateTime.UtcNow;
            return Task.FromResult(existing);
        }
        return Task.FromResult(phrase);
    }

    public Task<bool> DeleteAsync(int id)
    {
        var phrase = _phrases.FirstOrDefault(p => p.Id == id);
        if (phrase != null)
        {
            _phrases.Remove(phrase);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }
}
