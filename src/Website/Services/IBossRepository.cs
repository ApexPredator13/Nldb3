using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IBossRepository
    {
        Task SaveBoss(SaveBossModel boss);
        Task<int> CountBosses();
        Task<Boss?> GetBossById(string id, bool includeMod, bool includeTags);
    }
}
