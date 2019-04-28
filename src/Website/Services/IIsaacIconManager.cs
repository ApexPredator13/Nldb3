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
    }
}
