using StdFrase.Api.Models;

namespace StdFrase.Api.Services;

public interface IPhraseService
{
    Task<IEnumerable<Phrase>> GetAllPhrasesAsync();
    Task<Phrase?> GetPhraseByIdAsync(int id);
    Task<Phrase> CreatePhraseAsync(Phrase phrase);
    Task<Phrase?> UpdatePhraseAsync(int id, Phrase phrase);
    Task<bool> DeletePhraseAsync(int id);
}
