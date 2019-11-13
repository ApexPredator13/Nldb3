using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Models.Admin;
using Website.Models.Database;
using Website.Models.SubmitEpisode;

namespace Website.Services
{
    public interface IModRepository
    {
        Task<List<int>> GetUsedModsForSubmittedEpisode(SubmittedCompleteEpisode episode);
        Task<int> SaveMod(CreateMod mod);
        Task<Mod?> GetModById(int id);
        Task<int?> GetModIdByName(string name);
        Task<Mod?> GetModByName(string name);
        Task<int> AddModUrl(CreateModLink modUrl);
        Task<int> RemoveModUrl(int modUrlId);
        Task<int> RemoveMod(int modId);
        Task<ModUrl?> GetModUrlById(int id);
        Task<int> CountMods();
        Task<List<Mod>> GetAllMods();
    }
}
