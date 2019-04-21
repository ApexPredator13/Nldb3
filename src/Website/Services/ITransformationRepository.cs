using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Validation;

namespace Website.Services
{
    public interface ITransformationRepository
    {
        Task SaveTransformation(SaveTransformation newTransformation);
        Task<int> CountTransformations();
        Task<List<string>> GetAvailableTransformationsForEpisode(DateTime episodeReleasedate, List<int>? usedMods);
    }
}
