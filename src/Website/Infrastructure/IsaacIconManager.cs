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
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp.Formats.Png;

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

        public async Task<(int width, int height)> GetPostedImageSize(IFormFile file)
        {
            var fileExtension = Path.GetExtension(file.FileName);

            if (fileExtension != ".png")
            {
                throw new Exception("invalid file format - must be .png!");
            }

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var imageDecoder = new PngDecoder();

            if (ms.Position == ms.Length)
            {
                ms.Position = ms.Seek(0, SeekOrigin.Begin);
            }

            var image = imageDecoder.Decode<Rgba32>(Configuration.Default, ms);

            if (image != null)
            {
                return (image.Width, image.Height);
            }
            else
            {
                throw new Exception("invalid png!");
            }
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

        public void EmbedIcon(IFormFile image, int xCoordinate, int yCoordinate, int width, int height)
        {
            using (var bigImage = GetDefaultImage())
            {
                using (var icon = Image.Load<Rgba32>(image.OpenReadStream()))
                {
                    int iconX = 0;
                    int iconY = 0;
                    for (int y = yCoordinate; y < yCoordinate + height; y++)
                    {
                        for (int x = xCoordinate; x < xCoordinate + width; x++)
                        {
                            var pixel = icon[iconX, iconY];
                            bigImage[x, y] = pixel;
                            iconX++;
                        }
                        iconX = 0;
                        iconY++;
                    }
                }

                bigImage.Save(_defaultIsaacImage);
            }

            GC.Collect();
            GC.WaitForPendingFinalizers();
        }

        public void ClearRectangle(int xCoordinate, int yCoordinate, int width, int height)
        {
            if (width <= 0 || height <= 0 || xCoordinate < 0 || yCoordinate < 0)
            {
                return;
            }

            using (var bigImage = GetDefaultImage())
            {
                for (int y = yCoordinate; y < yCoordinate + height; y++)
                {
                    for (int x = xCoordinate; x < xCoordinate + width; x++)
                    {
                        bigImage[x, y] = new Rgba32(0, 0, 0, 0);
                    }
                }

                bigImage.Save(_defaultIsaacImage);
            }
        }
    }
}
