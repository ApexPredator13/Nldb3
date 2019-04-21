using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IModRepository
    {
        Task<List<int>> GetUsedModsForSubmittedEpisode(SubmittedEpisode episode);
    }
}
