using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System.Threading.Tasks;

namespace Website.Services
{
    public interface IIsaacIconManager
    {
        Image<Rgba32> GetDefaultImage();
        Task<(int x, int y)> FindEmptySquare(int requiredWidth, int requiredHeight);
        void SetDefaultImage(string path);
        Task<(int width, int height)> GetPostedImageSize(IFormFile file);
        void EmbedIcon(IFormFile image, int xCoordinate, int yCoordinate, int width, int height);
    }
}
