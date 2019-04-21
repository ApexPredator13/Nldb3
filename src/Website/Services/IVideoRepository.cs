using System;
using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IVideoRepository
    {
        Task SaveVideo(SaveVideo newVideo);
        Task SubmitEpisode(SubmittedEpisode episode, string userId, SubmissionType type = SubmissionType.New);
        Task SubmitLostEpisode(string videoId, string userId);
        Task<int> CountVideos();
        Task<int> CountVideoSubmissions();
        Task<DateTime?> GetVideoReleasedate(string videoId);
    }
}
