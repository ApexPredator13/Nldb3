using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Microsoft.AspNetCore.Hosting;
using SixLabors.ImageSharp.PixelFormats;
using Website.Services;

namespace Website.Infrastructure
{
    public class IsaacIconManager : IIsaacIconManager
    {
        private readonly IWebHostEnvironment _env;
        private readonly IIsaacRepository _isaacRepository;
        private string _defaultIsaacImage;

        public IsaacIconManager(IWebHostEnvironment env, IIsaacRepository isaacRepository)
        {
            _env = env;
            _isaacRepository = isaacRepository;

            var path = Path.Combine(_env.WebRootPath, "img");
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }

            _defaultIsaacImage = Path.Combine(path, "isaac.png");
        }

        public void SetDefaultImage(string path)
        {
            _defaultIsaacImage = path;
        }

        public Image<Rgba32> GetDefaultImage()
        {
            return Image.Load(_defaultIsaacImage);
        }

        // tries to find an empty space 
        public async Task<(int x, int y)> FindEmptySquare(int requiredWidth, int requiredHeight)
        {
            using (var img = GetDefaultImage())
            {
                for (int y = 0; y <= img.Height - requiredHeight; y++)
                {
                    for (int x = 0; x <= img.Width - requiredWidth; x++)
                    {
                        if (HasEnoughEmptySpaceAtPixel(img, x, y, requiredWidth, requiredHeight))
                        {
                            if (!await _isaacRepository.CoordinatesAreTaken(x, y, requiredHeight, requiredWidth))
                            {
                                return (x, y);
                            }
                        }
                    }
                }
            }

            throw new Exception("image is not big enouth!");
        }

        public bool HasEnoughEmptySpaceAtPixel(Image<Rgba32> image, int currentX, int currentY, int requiredWidth, int requiredHeight)
        {
            for (int y = currentY; y < currentY + requiredHeight; y++)
            {
                for (int x = currentX; x < currentX + requiredWidth; x++)
                {
                    var pixel = image[x, y];
                    if (pixel.A > 0)
                    {
                        return false;
                    }
                }
            }
            return true;
        }
    }
}
