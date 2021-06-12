using Google.Apis.YouTube.v3.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Website.Models;
using Website.Models.Admin;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Resource;
using Website.Models.SubmitEpisode;

namespace Website.Services
{
    public interface IVideoRepository
    {
        Task SaveVideo(Video newVideo);
        Task UpdateVideoWithYoutubeData(params string[] id);
        Task SubmitEpisode(SubmittedCompleteEpisode episode, string userId, SubmissionType type = SubmissionType.New);
        Task SubmitLostEpisode(string videoId, string userId);
        Task<int> CountVideos(IsaacSearchOptions? request = null);
        Task<int> CountVideoSubmissions();
        Task<DateTime?> GetVideoReleasedate(string videoId);
        Task<VideoListResponse> GetYoutubeVideoData(params string[] videoIds);
        Task<NldbVideo?> GetVideoById(string videoId);
        Task<NldbVideo?> GetCompleteEpisode(string videoId);
        Task<string?> GetVideoTitle(string videoId);
        Task<int> SetThumbnails(ThumbnailDetails thumbnailDetails, string videoId);
        Task<int> UpdateVideosWithYoutubeData(IList<Video> updatedVideos);
        Task<bool> VideoExists(string videoId);
        Task<NldbVideoResult> GetVideos(IsaacSearchOptions request);
        Task<DateTime> GetMostRecentVideoReleaseDate();
        Task<DateTime> GetFirstVideoReleaseDate();
        Task<List<string>> GetVideosThatNeedYoutubeUpdate(int amount, bool updateVideosAfterwards = false);
        Task<MaxVideoStats> GetMaxVideoStats();
        Task<List<AdminSubmission>> GetSubmissions(int limit, int offset);
        Task<List<VideoContributor>> GetContributorsForVideo(string videoId);
        Task<int> SetVideoIsCurrentlyBeingAdded(string videoId);
        Task<int> GetTodaysContributions();
    }
}
