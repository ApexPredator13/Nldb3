using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Validation;
using Website.Models.Validation.SubmitEpisode;

namespace Website.Services
{
    public interface IModRepository
    {
        Task<List<int>> GetUsedModsForSubmittedEpisode(SubmittedEpisode episode);
        Task SaveMod(SaveMod mod);
        Task<Mod?> GetModById(int id);
        Task<int?> GetModIdByName(string name);
        Task<Mod?> GetModByName(string name);
        Task AddModUrl(AddModUrl modUrl);
        Task RemoveModUrl(int modUrlId);
    }
}
