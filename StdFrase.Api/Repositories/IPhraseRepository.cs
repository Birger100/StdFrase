using StdFrase.Api.Models;

namespace StdFrase.Api.Repositories;

public interface IPhraseRepository
{
    Task<IEnumerable<Phrase>> GetAllAsync();
    Task<Phrase?> GetByIdAsync(int id);
    Task<Phrase> AddAsync(Phrase phrase);
    Task<Phrase> UpdateAsync(Phrase phrase);
    Task<bool> DeleteAsync(int id);
}
