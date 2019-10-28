using AutoFixture.Xunit2;
using FluentAssertions;
using Google.Apis.YouTube.v3.Data;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.Controllers;
using Website.Areas.Admin.ViewModels;
using Website.Services;
using Xunit;

namespace WebsiteTests.Controllers
{
    public class AddVideoControllerTests
    {
        [Theory(DisplayName = "Index [POST] redisplays view if ModelState is invalid"), AutoData]
        public async Task T1(SaveVideo viewModel)
        {
            // arrange
            var repo = new Mock<IVideoRepository>();
            var controller = new AddVideosController(repo.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.Index(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(viewModel);

            repo.Verify(x => x.GetYoutubeVideoData(It.IsAny<string[]>()), Times.Never);
        }

        [Theory(DisplayName = "Index [POST] saves video if it doesn't exist yet"), AutoData]
        public async Task T2(SaveVideo viewModel)
        {
            // arrange
            var repo = new Mock<IVideoRepository>();
            repo.Setup(x => x.GetYoutubeVideoData(It.IsAny<string[]>())).ReturnsAsync(new VideoListResponse() { Items = new List<Video>() { new Video { Id = "some ID", Snippet = new VideoSnippet() { Thumbnails = new ThumbnailDetails() } } } });
            repo.Setup(x => x.VideoExists(It.IsAny<string>())).ReturnsAsync(false);
            repo.Setup(x => x.SaveVideo(It.IsAny<Video>())).Returns(Task.CompletedTask);
            repo.Setup(x => x.SetThumbnails(It.IsAny<ThumbnailDetails>(), It.IsAny<string>())).ReturnsAsync(1);
            var controller = new AddVideosController(repo.Object);

            // act
            var result = await controller.Index(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AddVideosController.VideosSaved));

            repo.Verify(x => x.GetYoutubeVideoData(It.IsAny<string[]>()), Times.Once);
            repo.Verify(x => x.VideoExists(It.IsAny<string>()), Times.Once);
            repo.Verify(x => x.SaveVideo(It.IsAny<Video>()), Times.Once);
            repo.Verify(x => x.SetThumbnails(It.IsAny<ThumbnailDetails>(), It.IsAny<string>()), Times.Once);
            repo.Verify(x => x.UpdateVideoWithYoutubeData(It.IsAny<Video>()), Times.Never);
        }

        [Theory(DisplayName = "Index [POST] updates video if it exist already"), AutoData]
        public async Task T3(SaveVideo viewModel)
        {
            // arrange
            var repo = new Mock<IVideoRepository>();
            repo.Setup(x => x.GetYoutubeVideoData(It.IsAny<string[]>())).ReturnsAsync(new VideoListResponse() { Items = new List<Video>() { new Video { Id = "some ID", Snippet = new VideoSnippet() { Thumbnails = new ThumbnailDetails() } } } });
            repo.Setup(x => x.VideoExists(It.IsAny<string>())).ReturnsAsync(true);
            repo.Setup(x => x.UpdateVideoWithYoutubeData(It.IsAny<Video>())).ReturnsAsync(1);
            repo.Setup(x => x.SetThumbnails(It.IsAny<ThumbnailDetails>(), It.IsAny<string>())).ReturnsAsync(1);
            var controller = new AddVideosController(repo.Object);

            // act
            var result = await controller.Index(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AddVideosController.VideosSaved));

            repo.Verify(x => x.GetYoutubeVideoData(It.IsAny<string[]>()), Times.Once);
            repo.Verify(x => x.VideoExists(It.IsAny<string>()), Times.Once);
            repo.Verify(x => x.UpdateVideoWithYoutubeData(It.IsAny<Video>()), Times.Once);
            repo.Verify(x => x.SetThumbnails(It.IsAny<ThumbnailDetails>(), It.IsAny<string>()), Times.Once);
            repo.Verify(x => x.SaveVideo(It.IsAny<Video>()), Times.Never);
        }
    }
}
