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
        // Task<List<(string id, int itemsNeeded)>> GetAvailableTransformationsForEpisode(DateTime episodeReleasedate, List<int>? usedMods);
        Task<string?> GetTransformationIdByName(string name);
        Task CreateTransformationItem(CreateTransformationItem item);
        Task<List<(string transformation, bool countsMultipleTimes, int itemsNeeded)>> ItemCountsTowardsTransformations(string itemId, string videoTitle, DateTime videoReleasedate);
    }
}
