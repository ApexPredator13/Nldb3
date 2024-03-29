﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Models.Admin;
using Website.Models.Resource;
using Npgsql;

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
        Task<int> MakeUntransformative(string transformationId, string isaacResourceId);
        Task<string?> GetFirstResourceIdFromName(string name);
        Task<List<(string transformation, bool countsMultipleTimes, int stepsNeeded)>> GetTransformationData(string resourceId, string videoTitle, DateTime videoReleasedate);
        Task<bool> HasTags(string resourceId, params Tag[] RequiredTags);
        Task<int> UpdateName(string id, string newName);
        Task<int> UpdateId(string oldId, string newId);
        Task<int> UpdateColor(ChangeColor changeColor);
        Task<int> UpdateMod(ChangeMod changeMod);
        Task<bool> CoordinatesAreTaken(int x, int y, int h, int w);
        Task<int> UpdateIconCoordinates(string resourceId, int x, int y, int w, int h);
        Task<int> UpdateExistsIn(string id, ExistsIn newExistsIn);
        Task<int> UpdateGameMode(string id, GameMode newGameMode);
        Task<List<GameplayEvent>> GetGameplayEventsForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null);
        Task<List<PlayedFloor>> GetFloorsForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null);
        Task<List<PlayedCharacter>> GetPlayedCharactersForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null);
        Task<List<SubmittedEpisode>> GetSubmittedEpisodesForVideo(string videoId, int? submissionId = null, TempTables? tableData = null, NpgsqlConnection? session = null);
        Task<int> AddTag(string id, Tag tag);
        Task<List<DateTime>> GetEncounteredIsaacResourceTimestamps(string isaacResourceId, int resourceNumber, GameplayEventType? eventType = null);
        Task<string?> GetResourceNameFromId(string id);
        Task<ResourceType> GetResourceTypeFromId(string id);
        Task<List<(int amount, IsaacResource foundAt)>> GetFoundAtRanking(string videoId);
        Task<List<(int amount, IsaacResource characters)>> GetCharacterRanking(string resourceId, int resourceNumber);
        Task<List<(int amount, IsaacResource curse)>> GetCurseRanking(string resourceId, int resourceNumber);
        Task<List<(int amount, IsaacResource floor)>> GetFloorRanking(string resourceId, int resourceNumber, GameplayEventType? eventType = null);
        Task<List<(int amount, IsaacResource item)>> GetTransformationItemRanking(string transformationId);
        List<AvailableStats> GetAvailableStats(IsaacResource resource);
        int GetResourceNumber(IsaacResource resource);
        int GetResourceNumber(ResourceType resourceType);
        Task<int> DeleteSubmission(int submissionId);
        Task<bool> ResourceExists(string resourceId);
        Task<int> ClearTags(string id);
        Task<int> ChangeDisplayOrder(ChangeDisplayOrder displayOrder);
        Task<GameplayEvent?> GetGameplayEventById(int id);
        Task<PlayedCharacter?> GetPlayedCharacterById(int playedCharacterId);
        Task<PlayedFloor?> GetPlayedFloorById(int id);
        Task<List<TransformativeIsaacResource>> GetTransformationItems(string transformationId);
        Task<(bool allowsMultiple, string? transformationId, string? requiredTitleString)> IsTransformativeForPointInTime(string isaacResourceId, DateTime pointInTime);
        Task<List<IsaacResource>> MostCommonItemsForItemSource(string itemsSourceName, int amount);
    }
}
