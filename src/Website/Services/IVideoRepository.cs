using Google.Apis.YouTube.v3.Data;
using System;
using System.Threading.Tasks;
using Website.Models;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;

namespace Website.Services
{
    public interface IVideoRepository
    {
        Task SaveVideo(Video newVideo);
        Task SubmitEpisode(SubmittedCompleteEpisode episode, string userId, SubmissionType type = SubmissionType.New);
        Task SubmitLostEpisode(string videoId, string userId);
        Task<int> CountVideos(GetVideos? request = null);
        Task<int> CountVideoSubmissions();
        Task<DateTime?> GetVideoReleasedate(string videoId);
        Task<VideoListResponse> GetYoutubeVideoData(params string[] videoIds);
        Task<Models.Database.NldbVideo?> GetVideoById(string videoId);
        Task<Models.Database.NldbVideo?> GetCompleteEpisode(string videoId);
        Task<string?> GetVideoTitle(string videoId);
        Task<int> SetThumbnails(ThumbnailDetails thumbnailDetails, string videoId);
        Task<int> UpdateVideo(Google.Apis.YouTube.v3.Data.Video updatedVideo);
        Task<bool> VideoExists(string videoId);
        Task<NldbVideoResult> GetVideos(GetVideos request);
    }
}
