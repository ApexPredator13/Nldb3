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
        (int embeddedIconWidth, int embeddedIconHeight) EmbedIcon(IFormFile image, int xCoordinate, int yCoordinate);
        void ClearRectangle(int xCoordinate, int yCoordinate, int width, int height);
        void RemoveTransparentBorder(Image<Rgba32> icon);
    }
}
