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
        Task<int> SaveMod(SaveMod mod);
        Task<Mod?> GetModById(int id);
        Task<int?> GetModIdByName(string name);
        Task<Mod?> GetModByName(string name);
        Task<int> AddModUrl(AddModUrl modUrl);
        Task<int> RemoveModUrl(int modUrlId);
        Task<int> RemoveMod(int modId);
        Task<ModUrl?> GetModUrlById(int id);
        Task<int> CountMods();
    }
}
