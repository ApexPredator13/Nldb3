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
            return Image.Load<Rgba32>(_defaultIsaacImage);
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

            var image = imageDecoder.Decode<Rgba32>(Configuration.Default, ms, System.Threading.CancellationToken.None);

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

        public (int embeddedIconWidth, int embeddedIconHeight) EmbedIcon(IFormFile image, int xCoordinate, int yCoordinate)
        {
            int width = 0;
            int height = 0;

            using (var bigImage = GetDefaultImage())
            {
                using (var icon = Image.Load<Rgba32>(image.OpenReadStream()))
                {
                    RemoveTransparentBorder(icon);
                    width = icon.Width;
                    height = icon.Height;

                    int iconX = 0;
                    int iconY = 0;

                    for (int y = yCoordinate; y < yCoordinate + icon.Height; y++)
                    {
                        for (int x = xCoordinate; x < xCoordinate + icon.Width; x++)
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

            return (width, height);
        }

        public void RemoveTransparentBorder(Image<Rgba32> icon)
        {
            // if whole image is transparent, just continue
            var colorWasFound = false;

            for (int y = 0; y < icon.Height; y++)
            {
                for (int x = 0; x < icon.Width; x++)
                {
                    var pixel = icon[x, y];
                    if (pixel.A > 0)
                    {
                        colorWasFound = true;
                        break;
                    }
                }

                if (colorWasFound)
                {
                    break;
                }
            }

            if (!colorWasFound)
            {
                return;
            }

            // adds a transparent outline around the image
            // otherwise the algorithm below won't work if there are non-transparent pixels on any edge
            var options = new ResizeOptions()
            {
                Compand = true,
                Mode = ResizeMode.BoxPad,
                Position = AnchorPositionMode.Center,
                Size = new Size(icon.Width + 2, icon.Height + 2)
            };
            icon.Mutate(x => x.Resize(options));

            var transparentRowsFromTop = new List<int>();
            var transparentRowsFromRight = new List<int>();
            var transparentRowsFromBottom = new List<int>();
            var transparentRowsFromLeft = new List<int>();

            // gets transparent rows from every edge
            for (int y = 0; y < icon.Height; y++)
            {
                bool isTransparent = true;
                for (int x = 0; x < icon.Width; x++)
                {
                    var pixel = icon[x, y];

                    if (pixel.A > 0)
                    {
                        isTransparent = false;
                        break;
                    }
                }

                if (!isTransparent)
                {
                    break;
                }
                else
                {
                    transparentRowsFromTop.Add(y);
                }
            }

            for (int y = icon.Height - 1; y >= 0; y--)
            {
                bool isTransparent = true;
                for (int x = 0; x < icon.Width; x++)
                {
                    var pixel = icon[x, y];

                    if (pixel.A > 0)
                    {
                        isTransparent = false;
                        break;
                    }
                }

                if (!isTransparent)
                {
                    break;
                }
                else
                {
                    transparentRowsFromBottom.Add(y);
                }
            }

            for (int x = 0; x < icon.Width; x++)
            {
                bool isTransparent = true;
                for (int y = 0; y < icon.Height; y++)
                {
                    var pixel = icon[x, y];

                    if (pixel.A > 0)
                    {
                        isTransparent = false;
                        break;
                    }
                }

                if (!isTransparent)
                {
                    break;
                }
                else
                {
                    transparentRowsFromLeft.Add(x);
                }
            }

            for (int x = icon.Width - 1; x >= 0; x--)
            {
                bool isTransparent = true;
                for (int y = 0; y < icon.Height; y++)
                {
                    var pixel = icon[x, y];

                    if (pixel.A > 0)
                    {
                        isTransparent = false;
                        break;
                    }
                }

                if (!isTransparent)
                {
                    break;
                }
                else
                {
                    transparentRowsFromRight.Add(x);
                }
            }

            if (!transparentRowsFromLeft.Any() || !transparentRowsFromRight.Any() || !transparentRowsFromTop.Any() || !transparentRowsFromBottom.Any())
            {
                return;
            }

            // crops transparent edges
            var startingPoint = new Point(transparentRowsFromLeft.LastOrDefault() + 1, transparentRowsFromTop.LastOrDefault() + 1);
            var visibleWidth = (transparentRowsFromRight.Last() - 1) - transparentRowsFromLeft.Last();
            var visibleHeight = (transparentRowsFromBottom.Last() - 1) - transparentRowsFromTop.Last();
            var size = new Size(visibleWidth, visibleHeight);
            var rectangle = new Rectangle(startingPoint, size);
            
            icon.Mutate(x => x.Crop(rectangle));
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
