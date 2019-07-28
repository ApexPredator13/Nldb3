using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
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
    [Collection("database_tests")]
    public class IsaacIconManagerTests
    {
        private readonly DatabaseTestFixture _fixture;
        private readonly string testImage1 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test1.png");
        private readonly string testImage2 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test2.png");
        private readonly string testImage3 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test3.png");
        private readonly string testImage4 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test4.png");
        private readonly string testImage5 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test5.png");
        private readonly string testImage6 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test6.png");
        private readonly string testImage7 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "embed_test.png");
        private readonly string testImage8 = Path.Combine(Directory.GetCurrentDirectory(), "contentRoot", "wwwroot", "img", "test8.png");

        public IsaacIconManagerTests(DatabaseTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact(DisplayName = "GetImage can open an image")]
        public void T1()
        {
            // ARRANGE - 
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage1);

            // act
            var image = iconManager.GetDefaultImage();

            // assert
            image.Should().NotBeNull();
            image.Height.Should().BeGreaterOrEqualTo(1);
            image.Width.Should().BeGreaterOrEqualTo(1);
            image.Dispose();
        }

        [Fact(DisplayName = "FindEmptySquare can find exact empty 30x30 square at the bottom of existing content")]
        public async Task T2()
        {
            // arrange
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            isaacRepo.Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(false);
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage1);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            x.Should().Be(0);
            y.Should().Be(30);
        }

        [Fact(DisplayName = "FindEmptySquare can find exact empty 30x30 square at the right of existing content")]
        public async Task T3()
        {
            // arrange
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            isaacRepo.Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(false);
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage2);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            x.Should().Be(30);
            y.Should().Be(0);
        }

        [Fact(DisplayName = "FindEmptySquare can find exact empty 30x30 square in the middle of existing content")]
        public async Task T4()
        {
            // arrange
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            isaacRepo.Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(false);
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage3);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            x.Should().Be(30);
            y.Should().Be(30);
        }

        [Fact(DisplayName = "FindEmptySquare throws if available space in the entire image is only one pixel too tiny")]
        public void T5()
        {
            // arrange
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            isaacRepo.Setup(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(false);
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage4);

            // act
            Func<Task> shouldThrow = async () => await iconManager.FindEmptySquare(30, 30);

            // assert
            shouldThrow.Should().Throw<Exception>();
        }

        [Fact(DisplayName = "FindEmptySquare skips an available space if it is taken by another image, and takes the next available.")]
        public async Task T6()
        {
            // arrange
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            isaacRepo.SetupSequence(x => x.CoordinatesAreTaken(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(true).ReturnsAsync(false);
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage5);

            // act
            var (x, y) = await iconManager.FindEmptySquare(30, 30);

            // assert
            x.Should().Be(60);
            y.Should().Be(60);
        }

        [Fact(DisplayName = "GetPostedImageSize returns correct image size")]
        public async Task T7()
        {
            // arrange
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);

            using var fs = new FileStream(testImage1, FileMode.Open);
            var file = new FormFile(fs, 0, fs.Length, "name", "image.png");

            // act
            var (w, h) = await iconManager.GetPostedImageSize(file);

            // assert
            w.Should().Be(30);
            h.Should().Be(60);
        }

        [Fact(DisplayName = "EmbedIcon can embed an icon in a bigger image")]
        public void T8()
        {
            // arrange
            File.Copy(testImage1, testImage7, true);
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage7);

            using (var fs = new FileStream(testImage6, FileMode.Open))
            {
                var postedFile = new FormFile(fs, 0, fs.Length, "icon", "icon.png");

                // act
                iconManager.EmbedIcon(postedFile, 0, 30, 30, 30);
            }

            // assert - compare top and lower half of the images
            using var img = Image.Load(testImage7);
            for (var y = 0; y < 30; y++)
            {
                for (var x = 0; x < 30; x++)
                {
                    var topPixel = img[x, y];

                    // exchange (255,255,255,0) with (0,0,0,0), because they are effectively the same
                    // imagesharp seems to always write (0,0,0,0), but the original image can have pixels with (255,255,255,0)
                    if (topPixel == new SixLabors.ImageSharp.PixelFormats.Rgba32(255, 255, 255, 0))
                    {
                        topPixel = new SixLabors.ImageSharp.PixelFormats.Rgba32(0, 0, 0, 0);
                    }

                    var bottomPixel = img[x, y + 30];

                    topPixel.Equals(bottomPixel).Should().BeTrue();
                }
            }
        }

        [Fact(DisplayName = "ClearRectangle can set an area in the picture to (0,0,0,0)")]
        public void T9()
        {
            // arrange
            var environment = _fixture.TestServer.Host.Services.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            var isaacRepo = new Mock<IIsaacRepository>();
            IIsaacIconManager iconManager = new IsaacIconManager(environment, isaacRepo.Object);
            iconManager.SetDefaultImage(testImage8);

            // act
            iconManager.ClearRectangle(0, 30, 30, 30);

            // assert - make sure the entire bottom is now clear
            var emptyPixel = new Rgba32(0, 0, 0, 0);
            using var img = Image.Load(testImage8);
            for (int y = 30; y < 60; y++)
            {
                for (int x = 0; x < 30; x++)
                {
                    img[x, y].Equals(emptyPixel).Should().BeTrue();
                }
            }
        }
    }
}

