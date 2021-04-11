using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Website.Infrastructure;
using Website.Services;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Infrastructure
{
    [Collection("IntegrationTests")]
    public class IsaacIconManagerTests
    {
        private readonly IntegrationTestsFixture _fixture;
        private readonly string testImage1 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test1.png");
        private readonly string testImage2 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test2.png");
        private readonly string testImage3 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test3.png");
        private readonly string testImage4 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test4.png");
        private readonly string testImage5 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test5.png");
        private readonly string testImage6 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test6.png");
        private readonly string testImage7 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "embed_test.png");
        private readonly string testImage8 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test8.png");

        public IsaacIconManagerTests(IntegrationTestsFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact(DisplayName = "#SetDefaultImage > can set the default image")]
        public void T1()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var iconManager = scope.ServiceProvider.GetRequiredService<IIsaacIconManager>();
            iconManager.SetDefaultImage(testImage1);

            // act
            using var image = iconManager.GetDefaultImage();

            // assert
            Assert.NotNull(image);
            Assert.Equal(60, image.Height);
            Assert.Equal(30, image.Width);
        }

        [Fact(DisplayName = "FindEmptySquare > finds empty space at the bottom")]
        public async Task T2()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            var isaacRepo = new Mock<IIsaacRepository>(MockBehavior.Strict);
            isaacRepo
                .Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(false)
                .Verifiable();

            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage1);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            Assert.Equal(0, x);
            Assert.Equal(30, y);

            isaacRepo.Verify(
                x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), 
                Times.Once, 
                "the icon manager should have checked if the coordinates are already taken by another icon");
        }

        [Fact(DisplayName = "FindEmptySquare > finds empty space to the right")]
        public async Task T3()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            var isaacRepo = new Mock<IIsaacRepository>(MockBehavior.Strict);
            isaacRepo
                .Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(false)
                .Verifiable();

            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage2);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            Assert.Equal(30, x);
            Assert.Equal(0, y);

            isaacRepo.Verify(
                x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), 
                Times.Once,
                "the icon manager should have checked if the coordinates are already taken by another icon");
        }

        [Fact(DisplayName = "FindEmptySquare > finds empty space in the middle of existing pixels")]
        public async Task T4()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            var isaacRepo = new Mock<IIsaacRepository>(MockBehavior.Strict);
            isaacRepo
                .Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(false)
                .Verifiable();

            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage3);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            Assert.Equal(30, x);
            Assert.Equal(30, y);

            isaacRepo.Verify(
                x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()),
                Times.Once,
                "the icon manager should have checked if the coordinates are already taken by another icon");
        }

        [Fact(DisplayName = "FindEmptySquare > available space 1px too tiny > throws")]
        public void T5()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            var isaacRepo = new Mock<IIsaacRepository>(MockBehavior.Strict);
            isaacRepo
                .Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(false)
                .Verifiable();

            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage4);

            // act
            async Task shouldThrow() => await iconManager.FindEmptySquare(30, 30);

            // assert
            Assert.ThrowsAsync<Exception>(shouldThrow);

            isaacRepo.Verify(
                x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()),
                Times.Never,
                "if the image is too small, no check should be performed by the icon manager");
        }

        [Fact(DisplayName = "FindEmptySquare > free pixel space taken by other icon > skips until space is available.")]
        public async Task T6()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            var isaacRepo = new Mock<IIsaacRepository>(MockBehavior.Strict);
            isaacRepo
                .SetupSequence(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(true)
                .ReturnsAsync(false);

            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage5);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            Assert.Equal(60, x);
            Assert.Equal(60, y);
        }

        [Fact(DisplayName = "GetPostedImageSize > can return correct image size")]
        public async Task T7()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var iconManager = scope.ServiceProvider.GetRequiredService<IIsaacIconManager>();

            using var fs = new FileStream(testImage1, FileMode.Open);
            var file = new FormFile(fs, 0, fs.Length, "name", "image.png");

            // act
            var (width, height) = await iconManager.GetPostedImageSize(file);

            // assert
            Assert.Equal(30, width);
            Assert.Equal(60, height);
        }

        [Fact(DisplayName = "EmbedIcon > can embed icon into a bigger image")]
        public void T8()
        {
            // arrange
            // create test image by copying image one
            File.Copy(testImage1, testImage7, true);

            using var scope = _fixture.CreateScope();
            var iconManager = scope.ServiceProvider.GetRequiredService<IIsaacIconManager>();
            iconManager.SetDefaultImage(testImage7);

            // act
            // embed image6 into image7
            using (var fs = new FileStream(testImage6, FileMode.Open))
            {
                var postedFile = new FormFile(fs, 0, fs.Length, "icon", "icon.png");
                iconManager.EmbedIcon(postedFile, 0, 30);
            }

            // assert
            // compare all pixels - they should be the same now
            using Image<Rgba32> img = Image.Load<Rgba32>(testImage7);
            for (var y = 0; y < 30; y++)
            {
                for (var x = 0; x < 30; x++)
                {
                    var topPixel = img[x, y];

                    // exchange (255,255,255,0) with (0,0,0,0), because they are effectively the same
                    // imagesharp seems to always write (0,0,0,0), but the original image can have pixels with (255,255,255,0)
                    if (topPixel == new Rgba32(255, 255, 255, 0))
                    {
                        topPixel = new Rgba32(0, 0, 0, 0);
                    }

                    var bottomPixel = img[x, y + 30];
                    if (bottomPixel == new Rgba32(255, 255, 255, 0))
                    {
                        bottomPixel = new Rgba32(0, 0, 0, 0);
                    }
                    Assert.True(topPixel.Equals(bottomPixel));
                }
            }
        }

        [Fact(DisplayName = "ClearRectangle > can set clear an area in the picture to (0,0,0,0)")]
        public void T9()
        {
            // arrange
            using var scope = _fixture.CreateScope();
            var iconManager = scope.ServiceProvider.GetRequiredService<IIsaacIconManager>();
            iconManager.SetDefaultImage(testImage8);

            // act
            iconManager.ClearRectangle(0, 30, 30, 30);

            // assert - make sure the entire bottom is now clear
            var emptyPixel = new Rgba32(0, 0, 0, 0);
            using Image<Rgba32> img = Image.Load<Rgba32>(testImage8);
            for (int y = 30; y < 60; y++)
            {
                for (int x = 0; x < 30; x++)
                {
                    Assert.True(img[x, y].Equals(emptyPixel));
                }
            }
        }
    }
}

