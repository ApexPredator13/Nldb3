using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Areas.Api.Models;
using Website.Models.SubmitEpisode;

namespace Website.Services
{
    public interface IIsaacRepository
    {
        Task<History> GetHistory(SubmittedCompleteEpisode episode);
        Task<string?> SaveResource(CreateIsaacResource resource, int x, int y, int w, int h);
        Task<int> CountResources(ResourceType type = ResourceType.Unspecified);
        Task<IsaacResource?> GetResourceById(string id, bool includeMod);
        Task<List<IsaacResource>> GetResources(GetResource request);
        Task<int> DeleteResource(string resourceId);
        Task<int> MakeTransformative(MakeIsaacResourceTransformative model);
        Task<string?> GetFirstResourceIdFromName(string name);
        Task<List<(string transformation, bool countsMultipleTimes, int stepsNeeded)>> GetTransformationData(string resourceId, string videoTitle, DateTime videoReleasedate);
        Task<bool> HasTags(string resourceId, params Effect[] RequiredTags);
        Task<int> UpdateName(string id, string newName);
        Task<int> UpdateId(string oldId, string newId);
        Task<int> UpdateColor(ChangeColor changeColor);
        Task<int> UpdateMod(ChangeMod changeMod);
        Task<bool> CoordinatesAreTaken(int x, int y, int h, int w);
        Task<int> UpdateIconCoordinates(string resourceId, int x, int y, int w, int h);
        Task<int> UpdateExistsIn(string id, ExistsIn newExistsIn);
        Task<int> UpdateGameMode(string id, GameMode newGameMode);
        Task<List<GameplayEvent>> GetGameplayEventsForVideo(string videoId, int? submissionId = null);
        Task<List<PlayedFloor>> GetFloorsForVideo(string videoId, int? submissionId = null);
        Task<List<PlayedCharacter>> GetPlayedCharactersForVideo(string videoId, int? submissionId = null);
        Task<List<SubmittedEpisode>> GetSubmittedEpisodesForVideo(string videoId, int? submissionId = null);
        Task<int> AddTag(string id, Effect tag);
        Task<List<DateTime>> GetEncounteredIsaacResourceTimestamps(string isaacResourceId, int resourceNumber, GameplayEventType? eventType = null);
        Task<string?> GetResourceNameFromId(string id);
        Task<ResourceType> GetResourceTypeFromId(string id);
        Task<List<(int amount, IsaacResource foundAt)>> GetFoundAtRanking(string videoId);
        Task<List<(int amount, IsaacResource characters)>> GetCharacterRanking(string resourceId, int resourceNumber);
        Task<List<(int amount, IsaacResource curse)>> GetCurseRanking(string resourceId, int resourceNumber);
        Task<List<(int amount, IsaacResource floor)>> GetFloorRanking(string resourceId, int resourceNumber);
        Task<List<(int amount, IsaacResource item)>> GetTransformationItemRanking(string transformationId);
        List<AvailableStats> GetAvailableStats(IsaacResource resource);
        int GetResourceNumber(IsaacResource resource);
        int GetResourceNumber(ResourceType resourceType);
    }
}
