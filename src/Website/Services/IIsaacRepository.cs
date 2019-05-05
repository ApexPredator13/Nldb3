﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models;
using Website.Areas.Api.Models;

namespace Website.Services
{
    public interface IIsaacRepository
    {
        Task<string> SaveResource(CreateIsaacResource resource, int x, int y, int w, int h);
        Task<int> CountResources(ResourceType type = ResourceType.Unspecified);
        Task<IsaacResource?> GetResourceById(string id, bool includeMod);
        Task<List<IsaacResource>> GetResources(GetResource request);
        Task<int> DeleteResource(string resourceId);
        Task<int> MakeTransformative(MakeIsaacResourceTransformative model);
        Task<string> GetFirstResourceIdFromName(string name);
        Task<List<(string transformation, bool countsMultipleTimes, int stepsNeeded)>> GetTransformationData(string resourceId, string videoTitle, DateTime videoReleasedate);
        Task<bool> HasTags(string resourceId, params Effect[] RequiredTags);
        Task<int> UpdateName(string id, string newName);
        Task<int> UpdateId(string oldId, string newId);
        Task<bool> CoordinatesAreTaken(int x, int y, int h, int w);
        Task<int> UpdateIconCoordinates(string resourceId, int x, int y, int w, int h);
        Task<int> UpdateExistsIn(string id, ExistsIn newExistsIn);
        Task<int> UpdateGameMode(string id, GameMode newGameMode);
        Task<List<GameplayEvent>> GetGameplayEventsForVideo(string videoId, int? submissionId = null);
        Task<List<PlayedFloor>> GetFloorsForVideo(string videoId, int? submissionId = null);
        Task<List<PlayedCharacter>> GetPlayedCharactersForVideo(string videoId, int? submissionId = null);
        Task<List<SubmittedEpisode>> GetSubmittedEpisodesForVideo(string videoId, int? submissionId = null);
    }
}