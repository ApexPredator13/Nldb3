using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IIsaacRepository
    {
        Task<string> SaveResource(SaveIsaacResource resource);
        Task<int> CountResources(ResourceType type = ResourceType.Unspecified);
        Task<IsaacResource?> GetResourceById(string id, bool includeMod, bool includeTags);
        Task<int> AddTag(AddTag tag);
        Task<List<IsaacResource>> GetResources(GetResource request);
        Task<int> DeleteResource(string resourceId);
        Task<Tag?> GetTagById(int tagId);
        Task<List<Tag>> GetTags(string resourceId);
        Task<int> RemoveTag(int tagId);
        Task<int> MakeTransformative(MakeIsaacResourceTransformative model);
        Task<string> GetFirstResourceIdFromName(string name);
        Task<List<(string transformation, bool countsMultipleTimes, int stepsNeeded)>> GetTransformationData(string resourceId, string videoTitle, DateTime videoReleasedate);
        Task<bool> IsSpacebarItem(string resourceId);
    }
}
