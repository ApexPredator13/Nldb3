using AutoFixture.Xunit2;
using FluentAssertions;
using Google.Apis.YouTube.v3.Data;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Database.Enums;
using Website.Models.SubmitEpisode;
using Website.Services;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Repositories
{
    [Collection("database_tests")]
    public class QuoteRepositoryTests
    {
        private readonly DatabaseTestFixture _fixture;
        private readonly string _userId;
        private readonly string _userName;

        public QuoteRepositoryTests(DatabaseTestFixture fixture)
        {
            _fixture = fixture;
            var config = _fixture.TestServer.Host.Services.GetService(typeof(IConfiguration)) as IConfiguration;
            _userId = config["DeletedUserId"];
            _userName = config["DeletedUserName"];
        }

        [Theory(DisplayName = "SaveQuote/GetQuoteById can save/return a quote"), AutoData]
        public async Task T1(SubmittedQuote quote, Video video)
        {
            // arrange
            video.ContentDetails.Duration = "PT1H34M";
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IQuoteRepository)) as IQuoteRepository;
            await videoRepo.SaveVideo(video);
            quote.VideoId = video.Id;

            // act
            var quoteId = await repo.SaveQuote(quote, _userId);
            var savedQuote = await repo.GetQuoteById(quoteId, _userId);

            // assert
            quoteId.Should().BeGreaterOrEqualTo(1);
            savedQuote.At.Should().Be(quote.At);
            savedQuote.Contributor.Should().Be(_userName);
            savedQuote.Id.Should().Be(quoteId);
            savedQuote.QuoteText.Should().Be(quote.Content);
            savedQuote.VideoId.Should().Be(video.Id);
        }

        [Theory(DisplayName = "DeleteQuote can delete a quote"), AutoData]
        public async Task T2(SubmittedQuote quote, Video video)
        {
            // arrange
            video.ContentDetails.Duration = "PT1H34M";
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IQuoteRepository)) as IQuoteRepository;
            await videoRepo.SaveVideo(video);
            quote.VideoId = video.Id;
            var quoteId = await repo.SaveQuote(quote, _userId);

            // act
            var quoteBefore = await repo.GetQuoteById(quoteId, _userId);
            var deleteResult = await repo.DeleteQuote(quoteId, _userId);
            var quoteAfter = await repo.GetQuoteById(quoteId, _userId);

            quoteBefore.Should().NotBeNull();
            deleteResult.Should().Be(1);
            quoteAfter.Should().BeNull();
        }

        [Theory(DisplayName = "GetQuotesForVideo can return a list of quotes"), AutoData]
        public async Task T3(SubmittedQuote quote1, SubmittedQuote quote2, Video video)
        {
            // arrange
            video.ContentDetails.Duration = "PT1H34M";
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IQuoteRepository)) as IQuoteRepository;
            await videoRepo.SaveVideo(video);
            quote1.VideoId = video.Id;
            quote2.VideoId = video.Id;

            var quoteId1 = await repo.SaveQuote(quote1, _userId);
            var quoteId2 = await repo.SaveQuote(quote2, _userId);

            // act
            var result = await repo.GetQuotesForVideo(video.Id, _userId);

            // assert
            result.Should().NotBeNullOrEmpty().And.HaveCount(2);

            result[0].At.Should().Be(quote1.At);
            result[0].Contributor.Should().Be(_userName);
            result[0].Id.Should().Be(quoteId1);
            result[0].QuoteText.Should().Be(quote1.Content);
            result[0].VideoId.Should().Be(video.Id);

            result[1].At.Should().Be(quote2.At);
            result[1].Contributor.Should().Be(_userName);
            result[1].Id.Should().Be(quoteId2);
            result[1].QuoteText.Should().Be(quote2.Content);
            result[1].VideoId.Should().Be(video.Id);
        }

        [Theory(DisplayName = "Vote can save / change a vote for a user"), AutoData]
        public async Task T4(SubmittedQuote quote, Video video, SubmittedQuoteVote vote1, SubmittedQuoteVote vote2)
        {
            // arrange
            video.ContentDetails.Duration = "PT1H34M";
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IQuoteRepository)) as IQuoteRepository;

            await videoRepo.SaveVideo(video);
            quote.VideoId = video.Id;
            var quoteId = await repo.SaveQuote(quote, _userId);

            vote1.QuoteId = quoteId;
            vote2.QuoteId = quoteId;

            vote1.Vote = Vote.Down;     // first downvote
            vote2.Vote = Vote.Up;       // then upvote - which overrides the downvote

            // act
            int voteIdDownvote = await repo.Vote(vote1, _userId);
            var votesAfterDownvote = await repo.GetVotesForUser(_userId);
            int voteIdUpvote = await repo.Vote(vote2, _userId);
            var votesAfterUpvote = await repo.GetVotesForUser(_userId);

            // assert
            voteIdDownvote.Should().BeGreaterOrEqualTo(1);
            voteIdUpvote.Should().Be(voteIdDownvote);

            votesAfterDownvote.Should().NotBeNullOrEmpty().And.HaveCount(1);
            votesAfterUpvote.Should().NotBeNullOrEmpty().And.HaveCount(1);

            votesAfterDownvote[0].Id.Should().Be(voteIdDownvote);
            votesAfterDownvote[0].Quote.Should().Be(quoteId);
            votesAfterDownvote[0].UserName.Should().Be(_userName);
            votesAfterDownvote[0].Vote.Should().Be(Vote.Down);

            votesAfterUpvote[0].Id.Should().Be(voteIdDownvote);
            votesAfterUpvote[0].Quote.Should().Be(quoteId);
            votesAfterUpvote[0].UserName.Should().Be(_userName);
            votesAfterUpvote[0].Vote.Should().Be(Vote.Up);
        }
    }
}
