using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Moq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Website.Infrastructure;
using Website.Models.Validation;
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
    }
}