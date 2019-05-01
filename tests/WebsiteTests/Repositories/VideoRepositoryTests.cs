using AutoFixture.Xunit2;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Data;
using Website.Models.Validation;
using Website.Services;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Repositories
{
    [Collection("database_tests")]
    public class VideoRepositoryTests
    {
        private readonly DatabaseTestFixture _fixture;

        public VideoRepositoryTests(DatabaseTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Fact(DisplayName = "GetYoutubeVideoData can get video data from the youtube API")]
        public async Task T1()
        {
            // arrange
            var videoId = "c5PLC6nmOO4";
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;

            // act
            var result = await videoRepo.GetYoutubeVideoData(videoId);

            // assert
            result.Items.Should().NotBeNullOrEmpty().And.HaveCount(1);

            // requested items exist
            result.Items[0].Snippet.Should().NotBeNull();
            result.Items[0].ContentDetails.Should().NotBeNull();
            result.Items[0].Statistics.Should().NotBeNull();

            result.Items[0].Snippet.Title.Should().Be("Let's Play - The Binding of Isaac - Episode 1 [Genesis]");
        }

        [Theory(DisplayName = "GetVideoReleasedate can return a release date"), AutoData]
        public async Task T2(SaveVideo video)
        {
            // arrange
            // TODO: get video by ID
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
        }
    }
}
