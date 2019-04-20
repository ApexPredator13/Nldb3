using System.Threading.Tasks;
using Website.Models.Database;
using Website.Models.Validation;

namespace Website.Services
{
    public interface IVideoRepository
    {
        Task SaveVideo(SaveVideo newVideo);
        Task SubmitEpisode(SubmittedEpisode episode, string userId);
        Task SubmitLostEpisode(string videoId, string userId);
    }
}
