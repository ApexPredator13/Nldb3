using AutoFixture.Xunit2;
using FluentAssertions;
using Google.Apis.YouTube.v3.Data;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Data;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Models.Validation.SubmitEpisode;
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

        [Theory(DisplayName = "SubmitEpisode/GetVideoById can create/read a complete isaac episode"), AutoDataMoq]
        public async Task T2(
            SaveVideo video, 
            CreateIsaacResource character, 
            CreateIsaacResource floor1, 
            CreateIsaacResource floor2, 
            CreateIsaacResource boss,
            CreateIsaacResource curse,
            CreateIsaacResource item,
            CreateIsaacResource itemSource,
            CreateIsaacResource transformation,
            CreateIsaacResource enemy)
        {
            // ARRANGE - create video and isaac resources
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;
            var config = _fixture.TestServer.Host.Services.GetService(typeof(IConfiguration)) as IConfiguration;

            video.Published = new DateTime(2019, 1, 1, 1, 1, 1, DateTimeKind.Utc);
            await videoRepo.SaveVideo(video);

            enemy.ResourceType = ResourceType.Enemy;
            enemy.FromMod = null;
            var enemyId = await isaacRepo.SaveResource(enemy, -1, -1, -1, -1);

            transformation.ResourceType = ResourceType.Transformation;
            transformation.FromMod = null;
            var transformationId = await isaacRepo.SaveResource(transformation, -1, -1, -1, -1);

            character.ResourceType = ResourceType.Character;
            character.FromMod = null;
            var characterId = await isaacRepo.SaveResource(character, -1, -1, -1, -1);

            floor1.ResourceType = ResourceType.Floor;
            floor1.FromMod = null;
            var floor1Id = await isaacRepo.SaveResource(floor1, -1, -1, -1, -1);

            floor2.ResourceType = ResourceType.Floor;
            floor2.FromMod = null;
            var floor2Id = await isaacRepo.SaveResource(floor2, -1, -1, -1, -1);

            boss.ResourceType = ResourceType.Boss;
            boss.FromMod = null;
            var bossId = await isaacRepo.SaveResource(boss, -1, -1, -1, -1);

            curse.ResourceType = ResourceType.Curse;
            curse.FromMod = null;
            var curseId = await isaacRepo.SaveResource(curse, -1, -1, -1, -1);

            item.ResourceType = ResourceType.Item;
            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, -1, -1, -1, -1);
            await isaacRepo.MakeTransformative(new MakeIsaacResourceTransformative() { TransformationId = transformationId, ResourceId = itemId, ValidFrom = new DateTime(1985, 1, 1), ValidUntil = new DateTime(2100, 1, 1), StepsNeeded = 1 });

            itemSource.ResourceType = ResourceType.ItemSource;
            itemSource.FromMod = null;
            var itemSourceId = await isaacRepo.SaveResource(itemSource, -1, -1, -1, -1);

            var submission = new SubmittedCompleteEpisode()
            {
                VideoId = video.Id,
                PlayedCharacters = new List<SubmittedPlayedCharacter>()
                {
                    new SubmittedPlayedCharacter()
                    {
                        CharacterId = characterId,
                        PlayedFloors = new List<SubmittedPlayedFloor>()
                        {
                            new SubmittedPlayedFloor()
                            {
                                FloorId = floor1Id,
                                gameplayEvents = new List<SubmittedGameplayEvent>()
                                {
                                    new SubmittedGameplayEvent()
                                    {
                                        EventType = GameplayEventType.Curse,
                                        RelatedResource1 = curseId
                                    },
                                    new SubmittedGameplayEvent()
                                    {
                                        EventType = GameplayEventType.Bossfight,
                                        RelatedResource1 = bossId,
                                        RelatedResource2 = null,
                                        RelatedResource3 = 1
                                    }
                                }
                            },
                            new SubmittedPlayedFloor()
                            {
                                FloorId = floor2Id,
                                gameplayEvents = new List<SubmittedGameplayEvent>()
                                {
                                    new SubmittedGameplayEvent()
                                    {
                                        EventType = GameplayEventType.ItemCollected,
                                        RelatedResource1 = itemId,
                                        RelatedResource2 = itemSourceId,
                                        Player = 2,
                                        RelatedResource3 = (int)ItemUsage.Touched
                                    }
                                }
                            }
                        }
                    },
                    new SubmittedPlayedCharacter()
                    {
                        CharacterId = characterId,
                        PlayedFloors = new List<SubmittedPlayedFloor>()
                        {
                            new SubmittedPlayedFloor()
                            {
                                FloorId = floor2Id,
                                gameplayEvents = new List<SubmittedGameplayEvent>()
                                {
                                    new SubmittedGameplayEvent()
                                    {
                                        EventType = GameplayEventType.CharacterDied,
                                        RelatedResource1 = enemyId
                                    }
                                }
                            }
                        }
                    }
                }
            };

            // ACT - write submitted episode to the database, then read it back
            await videoRepo.SubmitEpisode(submission, config["DeletedUserId"], SubmissionType.New);
            var episode = await videoRepo.GetCompleteEpisode(video.Id);

            // ASSERT - make sure episode got saved and retrieved correctly - CHECK EVERY SINGLE PROPERTY
            // video data
            episode.Should().NotBeNull();
            episode.CommentCount.Should().Be(video.CommentCount);
            episode.Dislikes.Should().Be(video.Dislikes);
            episode.Duration.Should().Be(TimeSpan.FromSeconds(video.Duration));
            episode.FavouriteCount.Should().Be(video.FavouriteCount);
            episode.HasCaption.Should().Be(video.HasCaption);
            episode.Id.Should().Be(video.Id);
            episode.Is3D.Should().Be(video.Is3D);
            episode.IsHD.Should().Be(video.IsHD);
            episode.Published.Should().Be(video.Published);
            episode.RequiresUpdate.Should().Be(video.NeedsUpdate);
            episode.Submissions.Should().NotBeNullOrEmpty().And.HaveCount(1);
            episode.Tags.Should().BeEquivalentTo(video.Tags);
            episode.Thumbnails.Should().BeEmpty();
            episode.Title.Should().Be(video.Title);
            episode.ViewCount.Should().Be(video.ViewCount);

            // submitted episode
            var submittedEpisode = episode.Submissions[0];
            submittedEpisode.Latest.Should().BeTrue();
            submittedEpisode.Id.Should().BeGreaterOrEqualTo(1);
            submittedEpisode.PlayedCharacters.Should().NotBeNullOrEmpty().And.HaveCount(2);
            submittedEpisode.SubmissionType.Should().Be(SubmissionType.New);
            submittedEpisode.UserName.Should().Be("Some User");
            submittedEpisode.Video.Should().Be(video.Id);

            // first character
            var firstCharacter = episode.Submissions[0].PlayedCharacters[0];
            firstCharacter.Action.Should().Be(1);
            firstCharacter.DiedFrom.Should().BeNull();
            firstCharacter.GameCharacter.Should().NotBeNull();
            firstCharacter.GameCharacter.Color.Should().Be(character.Color);
            firstCharacter.GameCharacter.CssCoordinates.Should().NotBeNull();
            firstCharacter.GameCharacter.Difficulty.Should().Be(character.Difficulty);
            firstCharacter.GameCharacter.DisplayOrder.Should().Be(character.DisplayOrder);
            firstCharacter.GameCharacter.ExistsIn.Should().Be(character.ExistsIn);
            firstCharacter.GameCharacter.GameMode.Should().Be(character.GameMode);
            firstCharacter.GameCharacter.Tags.Should().BeEquivalentTo(character.Tags);
            firstCharacter.Id.Should().BeGreaterOrEqualTo(1);
            firstCharacter.PlayedFloors.Should().NotBeNullOrEmpty().And.HaveCount(2);
            firstCharacter.RunNumber.Should().Be(1);
            firstCharacter.Submission.Should().Be(submittedEpisode.Id);

            // first character, first floor
            var firstFloor = firstCharacter.PlayedFloors[0];
            firstFloor.Action.Should().Be(2);
            firstFloor.DiedFrom.Should().BeNull();
            firstFloor.Floor.Color.Should().Be(floor1.Color);
            firstFloor.Floor.CssCoordinates.Should().NotBeNull();
            firstFloor.Floor.Difficulty.Should().Be(floor1.Difficulty);
            firstFloor.Floor.DisplayOrder.Should().Be(floor1.DisplayOrder);
            firstFloor.Floor.ExistsIn.Should().Be(floor1.ExistsIn);
            firstFloor.Floor.GameMode.Should().Be(floor1.GameMode);
            firstFloor.Floor.Id.Should().Be(floor1.Id);
            firstFloor.Floor.Name.Should().Be(floor1.Name);
            firstFloor.Floor.Tags.Should().BeEquivalentTo(floor1.Tags);
            firstFloor.Id.Should().BeGreaterOrEqualTo(1);
            firstFloor.FloorNumber.Should().Be(1);
            firstFloor.GameplayEvents.Should().NotBeNullOrEmpty().And.HaveCount(3);
            firstFloor.RunNumber.Should().Be(1);
            firstFloor.Submission.Should().Be(submittedEpisode.Id);

            // first character, first floor, first event (curse)
            var r1f1e1 = firstFloor.GameplayEvents[0];
            r1f1e1.Action.Should().Be(3);
            r1f1e1.EventType.Should().Be(GameplayEventType.Curse);
            r1f1e1.FloorNumber.Should().Be(1);
            r1f1e1.Id.Should().BeGreaterOrEqualTo(1);
            r1f1e1.InConsequenceOf.Should().BeNull();
            r1f1e1.Player.Should().BeNull();
            r1f1e1.Resource1.Should().NotBeNull();
            r1f1e1.Resource1.Color.Should().Be(curse.Color);
            r1f1e1.Resource1.CssCoordinates.Should().NotBeNull();
            r1f1e1.Resource1.Difficulty.Should().Be(curse.Difficulty);
            r1f1e1.Resource1.DisplayOrder.Should().Be(curse.DisplayOrder);
            r1f1e1.Resource1.ExistsIn.Should().Be(curse.ExistsIn);
            r1f1e1.Resource1.GameMode.Should().Be(curse.GameMode);
            r1f1e1.Resource1.Id.Should().Be(curseId);
            r1f1e1.Resource1.Name.Should().Be(curse.Name);
            r1f1e1.Resource1.Tags.Should().BeEquivalentTo(curse.Tags);
            r1f1e1.Resource2.Should().BeNull();
            r1f1e1.RunNumber.Should().Be(1);
            r1f1e1.Submission.Should().Be(submittedEpisode.Id);

            // first character, first floor, second event (bossfight)
            var r1f1e2 = firstFloor.GameplayEvents[1];
            r1f1e2.Action.Should().Be(4);
            r1f1e2.EventType.Should().Be(GameplayEventType.Bossfight);
            r1f1e2.FloorNumber.Should().Be(1);
            r1f1e2.Id.Should().BeGreaterOrEqualTo(1);
            r1f1e2.InConsequenceOf.Should().BeNull();
            r1f1e2.Player.Should().BeNull();
            r1f1e2.Resource1.Should().NotBeNull();
            r1f1e2.Resource1.Color.Should().Be(boss.Color);
            r1f1e2.Resource1.CssCoordinates.Should().NotBeNull();
            r1f1e2.Resource1.Difficulty.Should().Be(boss.Difficulty);
            r1f1e2.Resource1.DisplayOrder.Should().Be(boss.DisplayOrder);
            r1f1e2.Resource1.ExistsIn.Should().Be(boss.ExistsIn);
            r1f1e2.Resource1.GameMode.Should().Be(boss.GameMode);
            r1f1e2.Resource1.Id.Should().Be(boss.Id);
            r1f1e2.Resource1.Name.Should().Be(boss.Name);
            r1f1e2.Resource1.Tags.Should().BeEquivalentTo(boss.Tags);
            r1f1e2.Resource2.Should().BeNull();
            r1f1e2.RunNumber.Should().Be(1);
            r1f1e2.Submission.Should().Be(submittedEpisode.Id);

            // first character, first floor, third event (down to the next floor)
            var r1f1e3 = firstFloor.GameplayEvents[2];
            r1f1e3.Action.Should().Be(5);
            r1f1e3.EventType.Should().Be(GameplayEventType.DownToTheNextFloor);
            r1f1e3.FloorNumber.Should().Be(1);
            r1f1e3.Id.Should().BeGreaterOrEqualTo(1);
            r1f1e3.InConsequenceOf.Should().BeNull();
            r1f1e3.Player.Should().BeNull();
            r1f1e3.Resource1.Should().NotBeNull();
            r1f1e3.Resource1.Color.Should().Be(floor1.Color);
            r1f1e3.Resource1.CssCoordinates.Should().NotBeNull();
            r1f1e3.Resource1.Difficulty.Should().Be(floor1.Difficulty);
            r1f1e3.Resource1.DisplayOrder.Should().Be(floor1.DisplayOrder);
            r1f1e3.Resource1.ExistsIn.Should().Be(floor1.ExistsIn);
            r1f1e3.Resource1.GameMode.Should().Be(floor1.GameMode);
            r1f1e3.Resource1.Id.Should().Be(floor1.Id);
            r1f1e3.Resource1.Name.Should().Be(floor1.Name);
            r1f1e3.Resource1.Tags.Should().BeEquivalentTo(floor1.Tags);
            r1f1e3.Resource2.Should().BeNull();
            r1f1e3.RunNumber.Should().Be(1);
            r1f1e3.Submission.Should().Be(submittedEpisode.Id);

            // first character, second floor
            var secondFloor = firstCharacter.PlayedFloors[1];
            secondFloor.Action.Should().Be(6);
            secondFloor.DiedFrom.Should().BeNull();
            secondFloor.Floor.Color.Should().Be(floor2.Color);
            secondFloor.Floor.CssCoordinates.Should().NotBeNull();
            secondFloor.Floor.Difficulty.Should().Be(floor2.Difficulty);
            secondFloor.Floor.DisplayOrder.Should().Be(floor2.DisplayOrder);
            secondFloor.Floor.ExistsIn.Should().Be(floor2.ExistsIn);
            secondFloor.Floor.GameMode.Should().Be(floor2.GameMode);
            secondFloor.Floor.Id.Should().Be(floor2.Id);
            secondFloor.Floor.Name.Should().Be(floor2.Name);
            secondFloor.Floor.Tags.Should().BeEquivalentTo(floor2.Tags);
            secondFloor.Id.Should().BeGreaterOrEqualTo(1);
            secondFloor.FloorNumber.Should().Be(2);
            secondFloor.GameplayEvents.Should().NotBeNullOrEmpty().And.HaveCount(4);
            secondFloor.RunNumber.Should().Be(1);
            secondFloor.Submission.Should().Be(submittedEpisode.Id);

            // first character, second floor, first event (item collected)
            var r1f2e1 = secondFloor.GameplayEvents[0];
            r1f2e1.Action.Should().Be(7);
            r1f2e1.EventType.Should().Be(GameplayEventType.ItemCollected);
            r1f2e1.FloorNumber.Should().Be(2);
            r1f2e1.Id.Should().BeGreaterOrEqualTo(1);
            r1f2e1.InConsequenceOf.Should().BeNull();
            r1f2e1.Player.Should().Be(2);
            r1f2e1.Resource1.Should().NotBeNull();
            r1f2e1.Resource1.Color.Should().Be(item.Color);
            r1f2e1.Resource1.CssCoordinates.Should().NotBeNull();
            r1f2e1.Resource1.Difficulty.Should().Be(item.Difficulty);
            r1f2e1.Resource1.DisplayOrder.Should().Be(item.DisplayOrder);
            r1f2e1.Resource1.ExistsIn.Should().Be(item.ExistsIn);
            r1f2e1.Resource1.GameMode.Should().Be(item.GameMode);
            r1f2e1.Resource1.Id.Should().Be(item.Id);
            r1f2e1.Resource1.Name.Should().Be(item.Name);
            r1f2e1.Resource1.Tags.Should().BeEquivalentTo(item.Tags);
            r1f2e1.Resource2.Should().NotBeNull();
            r1f2e1.Resource2.Color.Should().Be(itemSource.Color);
            r1f2e1.Resource2.CssCoordinates.Should().NotBeNull();
            r1f2e1.Resource2.Difficulty.Should().Be(itemSource.Difficulty);
            r1f2e1.Resource2.DisplayOrder.Should().Be(itemSource.DisplayOrder);
            r1f2e1.Resource2.Id.Should().Be(itemSource.Id);
            r1f2e1.Resource2.Name.Should().Be(itemSource.Name);
            r1f2e1.Resource2.ExistsIn.Should().Be(itemSource.ExistsIn);
            r1f2e1.Resource2.GameMode.Should().Be(itemSource.GameMode);
            r1f2e1.Resource2.Tags.Should().BeEquivalentTo(itemSource.Tags);
            r1f2e1.Resource3.Should().Be((int)ItemUsage.Touched);
            r1f2e1.RunNumber.Should().Be(1);
            r1f2e1.Submission.Should().Be(submittedEpisode.Id);

            // first character, second floor, second event (transformation progress)
            var r1f2e2 = secondFloor.GameplayEvents[1];
            r1f2e2.Action.Should().Be(8);
            r1f2e2.EventType.Should().Be(GameplayEventType.TransformationProgress);
            r1f2e2.FloorNumber.Should().Be(2);
            r1f2e2.Id.Should().BeGreaterOrEqualTo(1);
            r1f2e2.InConsequenceOf.Should().BeNull();
            r1f2e2.Player.Should().Be(2);
            r1f2e2.Resource1.Should().NotBeNull();
            r1f2e2.Resource1.Color.Should().Be(item.Color);
            r1f2e2.Resource1.CssCoordinates.Should().NotBeNull();
            r1f2e2.Resource1.Difficulty.Should().Be(item.Difficulty);
            r1f2e2.Resource1.DisplayOrder.Should().Be(item.DisplayOrder);
            r1f2e2.Resource1.ExistsIn.Should().Be(item.ExistsIn);
            r1f2e2.Resource1.GameMode.Should().Be(item.GameMode);
            r1f2e2.Resource1.Id.Should().Be(item.Id);
            r1f2e2.Resource1.Name.Should().Be(item.Name);
            r1f2e2.Resource1.Tags.Should().BeEquivalentTo(item.Tags);
            r1f2e2.Resource2.Should().NotBeNull();
            r1f2e2.Resource2.Color.Should().Be(transformation.Color);
            r1f2e2.Resource2.CssCoordinates.Should().NotBeNull();
            r1f2e2.Resource2.Difficulty.Should().Be(transformation.Difficulty);
            r1f2e2.Resource2.DisplayOrder.Should().Be(transformation.DisplayOrder);
            r1f2e2.Resource2.Id.Should().Be(transformation.Id);
            r1f2e2.Resource2.Name.Should().Be(transformation.Name);
            r1f2e2.Resource2.ExistsIn.Should().Be(transformation.ExistsIn);
            r1f2e2.Resource2.GameMode.Should().Be(transformation.GameMode);
            r1f2e2.Resource2.Tags.Should().BeEquivalentTo(transformation.Tags);
            r1f2e2.Resource3.Should().Be(1);
            r1f2e2.RunNumber.Should().Be(1);
            r1f2e2.Submission.Should().Be(submittedEpisode.Id);

            // first character, second floor, third event (transformation complete)
            var r1f2e3 = secondFloor.GameplayEvents[2];
            r1f2e3.Action.Should().Be(9);
            r1f2e3.EventType.Should().Be(GameplayEventType.TransformationComplete);
            r1f2e3.FloorNumber.Should().Be(2);
            r1f2e3.Id.Should().BeGreaterOrEqualTo(1);
            r1f2e3.InConsequenceOf.Should().BeNull();
            r1f2e3.Player.Should().Be(2);
            r1f2e3.Resource1.Should().NotBeNull();
            r1f2e3.Resource1.Color.Should().Be(item.Color);
            r1f2e3.Resource1.CssCoordinates.Should().NotBeNull();
            r1f2e3.Resource1.Difficulty.Should().Be(item.Difficulty);
            r1f2e3.Resource1.DisplayOrder.Should().Be(item.DisplayOrder);
            r1f2e3.Resource1.ExistsIn.Should().Be(item.ExistsIn);
            r1f2e3.Resource1.GameMode.Should().Be(item.GameMode);
            r1f2e3.Resource1.Id.Should().Be(item.Id);
            r1f2e3.Resource1.Name.Should().Be(item.Name);
            r1f2e3.Resource1.Tags.Should().BeEquivalentTo(item.Tags);
            r1f2e3.Resource2.Should().NotBeNull();
            r1f2e3.Resource2.Color.Should().Be(transformation.Color);
            r1f2e3.Resource2.CssCoordinates.Should().NotBeNull();
            r1f2e3.Resource2.Difficulty.Should().Be(transformation.Difficulty);
            r1f2e3.Resource2.DisplayOrder.Should().Be(transformation.DisplayOrder);
            r1f2e3.Resource2.Id.Should().Be(transformation.Id);
            r1f2e3.Resource2.Name.Should().Be(transformation.Name);
            r1f2e3.Resource2.ExistsIn.Should().Be(transformation.ExistsIn);
            r1f2e3.Resource2.GameMode.Should().Be(transformation.GameMode);
            r1f2e3.Resource2.Tags.Should().BeEquivalentTo(transformation.Tags);
            r1f2e3.Resource3.Should().BeNull();
            r1f2e3.RunNumber.Should().Be(1);
            r1f2e3.Submission.Should().Be(submittedEpisode.Id);

            // first character, second floor, fourth event (won the run)
            var r1f2e4 = secondFloor.GameplayEvents[3];
            r1f2e4.Action.Should().Be(10);
            r1f2e4.EventType.Should().Be(GameplayEventType.WonTheRun);
            r1f2e4.FloorNumber.Should().Be(2);
            r1f2e4.Id.Should().BeGreaterOrEqualTo(1);
            r1f2e4.InConsequenceOf.Should().BeNull();
            r1f2e4.Player.Should().BeNull();
            r1f2e4.Resource1.Should().NotBeNull();
            r1f2e4.Resource1.Id.Should().Be(character.Id);
            r1f2e4.Resource1.Name.Should().Be(character.Name);
            r1f2e4.Resource1.Color.Should().Be(character.Color);
            r1f2e4.Resource1.CssCoordinates.Should().NotBeNull();
            r1f2e4.Resource1.Difficulty.Should().Be(character.Difficulty);
            r1f2e4.Resource1.DisplayOrder.Should().Be(character.DisplayOrder);
            r1f2e4.Resource1.ExistsIn.Should().Be(character.ExistsIn);
            r1f2e4.Resource1.GameMode.Should().Be(character.GameMode);
            r1f2e4.Resource1.Tags.Should().BeEquivalentTo(character.Tags);
            r1f2e4.Resource2.Should().NotBeNull();
            r1f2e4.Resource2.Color.Should().Be(floor2.Color);
            r1f2e4.Resource2.CssCoordinates.Should().NotBeNull();
            r1f2e4.Resource2.Id.Should().Be(floor2.Id);
            r1f2e4.Resource2.Name.Should().Be(floor2.Name);
            r1f2e4.Resource2.Difficulty.Should().Be(floor2.Difficulty);
            r1f2e4.Resource2.DisplayOrder.Should().Be(floor2.DisplayOrder);
            r1f2e4.Resource2.ExistsIn.Should().Be(floor2.ExistsIn);
            r1f2e4.Resource2.GameMode.Should().Be(floor2.GameMode);
            r1f2e4.Resource2.Tags.Should().BeEquivalentTo(floor2.Tags);
            r1f2e4.Resource3.Should().Be(2);
            r1f2e4.RunNumber.Should().Be(1);
            r1f2e4.Submission.Should().Be(submittedEpisode.Id);

            // second character
            var secondCharacter = episode.Submissions[0].PlayedCharacters[1];
            secondCharacter.Action.Should().Be(1);
            secondCharacter.DiedFrom.Should().NotBeNull();
            secondCharacter.DiedFrom.Color.Should().Be(enemy.Color);
            secondCharacter.DiedFrom.Name.Should().Be(enemy.Name);
            secondCharacter.DiedFrom.Id.Should().Be(enemy.Id);
            secondCharacter.DiedFrom.ResourceType.Should().Be(ResourceType.Enemy);
            secondCharacter.DiedFrom.CssCoordinates.Should().NotBeNull();
            secondCharacter.DiedFrom.Difficulty.Should().Be(enemy.Difficulty);
            secondCharacter.DiedFrom.DisplayOrder.Should().Be(enemy.DisplayOrder);
            secondCharacter.DiedFrom.ExistsIn.Should().Be(enemy.ExistsIn);
            secondCharacter.DiedFrom.GameMode.Should().Be(enemy.GameMode);
            secondCharacter.DiedFrom.Tags.Should().BeEquivalentTo(enemy.Tags);
            secondCharacter.GameCharacter.Should().NotBeNull();
            secondCharacter.GameCharacter.Color.Should().Be(character.Color);
            secondCharacter.GameCharacter.CssCoordinates.Should().NotBeNull();
            secondCharacter.GameCharacter.Difficulty.Should().Be(character.Difficulty);
            secondCharacter.GameCharacter.DisplayOrder.Should().Be(character.DisplayOrder);
            secondCharacter.GameCharacter.ExistsIn.Should().Be(character.ExistsIn);
            secondCharacter.GameCharacter.GameMode.Should().Be(character.GameMode);
            secondCharacter.GameCharacter.Id.Should().Be(character.Id);
            secondCharacter.GameCharacter.Name.Should().Be(character.Name);
            secondCharacter.GameCharacter.Tags.Should().BeEquivalentTo(character.Tags);
            secondCharacter.Id.Should().BeGreaterOrEqualTo(1);
            secondCharacter.PlayedFloors.Should().NotBeNullOrEmpty().And.HaveCount(1);
            secondCharacter.RunNumber.Should().Be(2);
            secondCharacter.Submission.Should().Be(submittedEpisode.Id);

            // second character, first floor
            var _firstFloor = secondCharacter.PlayedFloors[0];
            _firstFloor.Action.Should().Be(2);
            _firstFloor.DiedFrom.Should().NotBeNull();
            _firstFloor.DiedFrom.Should().NotBeNull();
            _firstFloor.DiedFrom.Color.Should().Be(enemy.Color);
            _firstFloor.DiedFrom.Name.Should().Be(enemy.Name);
            _firstFloor.DiedFrom.Id.Should().Be(enemy.Id);
            _firstFloor.DiedFrom.ResourceType.Should().Be(ResourceType.Enemy);
            _firstFloor.DiedFrom.CssCoordinates.Should().NotBeNull();
            _firstFloor.DiedFrom.Difficulty.Should().Be(enemy.Difficulty);
            _firstFloor.DiedFrom.DisplayOrder.Should().Be(enemy.DisplayOrder);
            _firstFloor.DiedFrom.ExistsIn.Should().Be(enemy.ExistsIn);
            _firstFloor.DiedFrom.GameMode.Should().Be(enemy.GameMode);
            _firstFloor.Floor.Color.Should().Be(floor2.Color);
            _firstFloor.Floor.CssCoordinates.Should().NotBeNull();
            _firstFloor.Floor.Difficulty.Should().Be(floor2.Difficulty);
            _firstFloor.Floor.DisplayOrder.Should().Be(floor2.DisplayOrder);
            _firstFloor.Floor.ExistsIn.Should().Be(floor2.ExistsIn);
            _firstFloor.Floor.GameMode.Should().Be(floor2.GameMode);
            _firstFloor.Floor.Id.Should().Be(floor2.Id);
            _firstFloor.Floor.Name.Should().Be(floor2.Name);
            _firstFloor.Floor.Tags.Should().BeEquivalentTo(floor2.Tags);
            _firstFloor.Id.Should().BeGreaterOrEqualTo(1);
            _firstFloor.FloorNumber.Should().Be(1);
            _firstFloor.GameplayEvents.Should().NotBeNullOrEmpty().And.HaveCount(2);
            _firstFloor.RunNumber.Should().Be(2);
            _firstFloor.Submission.Should().Be(submittedEpisode.Id);

            // second character, first floor, first event (character died)
            var r2f1e1 = _firstFloor.GameplayEvents[0];
            r2f1e1.Action.Should().Be(3);
            r2f1e1.EventType.Should().Be(GameplayEventType.CharacterDied);
            r2f1e1.FloorNumber.Should().Be(1);
            r2f1e1.Id.Should().BeGreaterOrEqualTo(1);
            r2f1e1.InConsequenceOf.Should().BeNull();
            r2f1e1.Player.Should().BeNull();
            r2f1e1.Resource1.Should().NotBeNull();
            r2f1e1.Resource1.Color.Should().Be(enemy.Color);
            r2f1e1.Resource1.CssCoordinates.Should().NotBeNull();
            r2f1e1.Resource1.Difficulty.Should().Be(enemy.Difficulty);
            r2f1e1.Resource1.DisplayOrder.Should().Be(enemy.DisplayOrder);
            r2f1e1.Resource1.ExistsIn.Should().Be(enemy.ExistsIn);
            r2f1e1.Resource1.GameMode.Should().Be(enemy.GameMode);
            r2f1e1.Resource1.Id.Should().Be(enemy.Id);
            r2f1e1.Resource1.Name.Should().Be(enemy.Name);
            r2f1e1.Resource1.Tags.Should().BeEquivalentTo(enemy.Tags);
            r2f1e1.Resource2.Should().BeNull();
            r2f1e1.RunNumber.Should().Be(2);
            r2f1e1.Submission.Should().Be(submittedEpisode.Id);

            // second character, first floor, second event (lost the run)
            var r2f1e2 = _firstFloor.GameplayEvents[1];
            r2f1e2.Action.Should().Be(4);
            r2f1e2.EventType.Should().Be(GameplayEventType.LostTheRun);
            r2f1e2.FloorNumber.Should().Be(1);
            r2f1e2.Id.Should().BeGreaterOrEqualTo(1);
            r2f1e2.InConsequenceOf.Should().BeNull();
            r2f1e2.Player.Should().BeNull();
            r2f1e2.Resource1.Should().NotBeNull();
            r2f1e2.Resource1.Id.Should().Be(character.Id);
            r2f1e2.Resource1.Name.Should().Be(character.Name);
            r2f1e2.Resource1.Color.Should().Be(character.Color);
            r2f1e2.Resource1.CssCoordinates.Should().NotBeNull();
            r2f1e2.Resource1.Difficulty.Should().Be(character.Difficulty);
            r2f1e2.Resource1.DisplayOrder.Should().Be(character.DisplayOrder);
            r2f1e2.Resource1.ExistsIn.Should().Be(character.ExistsIn);
            r2f1e2.Resource1.GameMode.Should().Be(character.GameMode);
            r2f1e2.Resource1.Tags.Should().BeEquivalentTo(character.Tags);
            r2f1e2.Resource2.Should().NotBeNull();
            r2f1e2.Resource2.Color.Should().Be(floor2.Color);
            r2f1e2.Resource2.CssCoordinates.Should().NotBeNull();
            r2f1e2.Resource2.Id.Should().Be(floor2.Id);
            r2f1e2.Resource2.Name.Should().Be(floor2.Name);
            r2f1e2.Resource2.Difficulty.Should().Be(floor2.Difficulty);
            r2f1e2.Resource2.DisplayOrder.Should().Be(floor2.DisplayOrder);
            r2f1e2.Resource2.ExistsIn.Should().Be(floor2.ExistsIn);
            r2f1e2.Resource2.GameMode.Should().Be(floor2.GameMode);
            r2f1e2.Resource2.Tags.Should().BeEquivalentTo(floor2.Tags);
            r2f1e2.Resource3.Should().Be(1);
            r2f1e2.RunNumber.Should().Be(2);
            r2f1e2.Submission.Should().Be(submittedEpisode.Id);
        }

        [Theory(DisplayName = "GetVideoReleasedate can return a video release date, returns null if not found"), AutoData]
        public async Task T3(SaveVideo video)
        {
            // arrange
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            video.Published = new DateTime(2019, 1, 1, 1, 1, 1);
            await videoRepo.SaveVideo(video);

            // act
            var releaseDate = await videoRepo.GetVideoReleasedate(video.Id);
            var releaseDateNull = await videoRepo.GetVideoReleasedate("wrong id");

            // assert
            releaseDate.Should().Be(video.Published);
            releaseDateNull.Should().BeNull();
        }

        [Theory(DisplayName = "GetVideoTitle can return a video title, returns null if not found"), AutoData]
        public async Task T4(SaveVideo video)
        {
            // arrange
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            await videoRepo.SaveVideo(video);

            // act
            var title = await videoRepo.GetVideoTitle(video.Id);
            var titleNull = await videoRepo.GetVideoTitle("wrong id");

            // assert
            title.Should().Be(video.Title);
            titleNull.Should().BeNull();
        }

        [Theory(DisplayName = "GetVideoById can return video with thumbnails, returns null if not found"), AutoData]
        public async Task T5(SaveVideo video, Thumbnail thumbnail)
        {
            // arrange
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            video.Published = new DateTime(2019, 1, 1, 1, 1, 1);
            await videoRepo.SaveVideo(video);
            int thumbnailId = await videoRepo.SaveThumbnail(thumbnail, video.Id);

            // act
            var v = await videoRepo.GetVideoById(video.Id);
            var vNull = await videoRepo.GetVideoById("wrong id");

            // assert
            vNull.Should().BeNull();
            v.CommentCount.Should().Be(video.CommentCount);
            v.Dislikes.Should().Be(video.Dislikes);
            v.Duration.Should().Be(TimeSpan.FromSeconds(video.Duration));
            v.FavouriteCount.Should().Be(video.FavouriteCount);
            v.HasCaption.Should().Be(video.HasCaption);
            v.Id.Should().Be(video.Id);
            v.Is3D.Should().Be(video.Is3D);
            v.IsHD.Should().Be(video.IsHD);
            v.Likes.Should().Be(video.Likes);
            v.Published.Should().Be(video.Published);
            v.RequiresUpdate.Should().Be(video.NeedsUpdate);
            v.Submissions.Should().BeEmpty();
            v.Tags.Should().BeEquivalentTo(video.Tags);
            v.Thumbnails.Should().NotBeNullOrEmpty().And.HaveCount(1);
            v.Thumbnails[0].Height.Should().Be((int)thumbnail.Height.Value);
            v.Thumbnails[0].Id.Should().Be(thumbnailId);
            v.Thumbnails[0].Url.Should().Be(thumbnail.Url);
            v.Thumbnails[0].Width.Should().Be((int)thumbnail.Width.Value);
            v.Title.Should().Be(video.Title);
            v.ViewCount.Should().Be(video.ViewCount);
        }

        [Theory(DisplayName = "ClearThumbnailsForVideo can clear thumbnails"), AutoData]
        public async Task T6(SaveVideo video, Thumbnail thumbnail1, Thumbnail thumbnail2)
        {
            // arrange
            var videoRepo = _fixture.TestServer.Host.Services.GetService(typeof(IVideoRepository)) as IVideoRepository;
            await videoRepo.SaveVideo(video);
            await videoRepo.SaveThumbnail(thumbnail1, video.Id);
            await videoRepo.SaveThumbnail(thumbnail2, video.Id);

            // act
            var videoBefore = await videoRepo.GetVideoById(video.Id);
            var deleteResult = await videoRepo.ClearThumbnailsForVideo(video.Id);
            var videoAfter = await videoRepo.GetVideoById(video.Id);

            // assert
            videoBefore.Thumbnails.Should().NotBeNullOrEmpty().And.HaveCount(2);
            deleteResult.Should().Be(2);
            videoAfter.Thumbnails.Should().BeEmpty();
        }
    }
}
