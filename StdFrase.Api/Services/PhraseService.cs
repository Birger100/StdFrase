using StdFrase.Api.Models;
using StdFrase.Api.Repositories;

namespace StdFrase.Api.Services;

public class PhraseService : IPhraseService
{
    private readonly IPhraseRepository _repository;

    public PhraseService(IPhraseRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Phrase>> GetAllPhrasesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Phrase?> GetPhraseByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Phrase> CreatePhraseAsync(Phrase phrase)
    {
        return await _repository.AddAsync(phrase);
    }

    public async Task<Phrase?> UpdatePhraseAsync(int id, Phrase phrase)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
        {
            return null;
        }

        phrase.Id = id;
        return await _repository.UpdateAsync(phrase);
    }

    public async Task<bool> DeletePhraseAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}
