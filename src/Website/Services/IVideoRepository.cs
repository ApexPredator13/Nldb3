using Google.Apis.YouTube.v3.Data;
using System;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Models.Validation.SubmitEpisode;

namespace Website.Services
{
    public interface IVideoRepository
    {
        Task SaveVideo(SaveVideo newVideo);
        Task SubmitEpisode(SubmittedCompleteEpisode episode, string userId, SubmissionType type = SubmissionType.New);
        Task SubmitLostEpisode(string videoId, string userId);
        Task<int> CountVideos();
        Task<int> CountVideoSubmissions();
        Task<DateTime?> GetVideoReleasedate(string videoId);
        Task<VideoListResponse> GetYoutubeVideoData(params string[] videoIds);
        Task<Models.Database.Video?> GetVideoById(string videoId);
        Task<Models.Database.Video?> GetCompleteEpisode(string videoId);
        Task<string?> GetVideoTitle(string videoId);
        Task<int> SaveThumbnail(Google.Apis.YouTube.v3.Data.Thumbnail thumbnail, string videoId);
        Task<int> ClearThumbnailsForVideo(string videoId);
    }
}
