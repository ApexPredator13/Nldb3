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
        Task<IsaacResource?> GetResourceByName(string name, bool includeMod, bool includeTags);
        Task<int> AddTag(AddTag tag);
        Task<List<IsaacResource>> GetResources(ResourceType resourceType, bool includeMod, bool includeTags, ResourceOrderBy orderBy1 = ResourceOrderBy.Unspecified, ResourceOrderBy orderBy2 = ResourceOrderBy.Unspecified, bool asc = true, params Effect[] requiredTags);
        Task<int> DeleteResource(string resourceId);
        Task<Tag?> GetTagById(int tagId);
        Task<List<Tag>> GetTags(string bossId);
        Task<int> RemoveTag(int tagId);
        Task<int> MakeIsaacResourceTransformative(MakeIsaacResourceTransformative model);
        Task<string> GetResourceIdFromName(string name);
    }
}
