using AutoFixture;
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
    public class BossRepositoryTests
    {
        private readonly IntegrationtestFixture _fixture;

        public BossRepositoryTests(IntegrationtestFixture fixture)
        {
            _fixture = fixture;
        }

        [Theory(DisplayName = "AddTag can create new bosstags"), AutoData]
        public async Task T2(SaveBossModel boss, AddTag tag1, AddTag tag2)
        {
            // ARRANGE - create boss
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;
            boss.FromMod = null;

            var bossId = await repo.SaveResource(boss);
            tag1.ResourceId = bossId;
            tag2.ResourceId = bossId;

            // ACT - add tag, read back boss
            var tagId1 = await repo.AddTag(tag1);
            var tagId2 = await repo.AddTag(tag2);
            var bossWithTag = await repo.GetResourceById(bossId, false, true);

            // ASSERT - boss has the correct tags
            tagId1.Should().BeGreaterThan(0);
            tagId2.Should().BeGreaterThan(0);

            bossWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(2);
            bossWithTag.Tags[0].Effect.Should().Be(tag1.Effect);
            bossWithTag.Tags[1].Effect.Should().Be(tag2.Effect);
            bossWithTag.Tags[0].Id.Should().Be(tagId1);
            bossWithTag.Tags[1].Id.Should().Be(tagId2);
        }


        [Theory(DisplayName = "SaveBoss/GetById/GetByName can create and read a boss by name/id, with and without mods and tags"), AutoData]
        public async Task T1(SaveBossModel boss, SaveMod mod, AddModUrl url, AddTag tag)
        {
            // ARRANGE - create mod, boss, tag
            var bossRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            var modId = await modRepo.SaveMod(mod);
            boss.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            boss.FromMod = modId;
            var bossId = await bossRepo.SaveResource(boss);

            tag.ResourceId = bossId;
            var tagId = await bossRepo.AddTag(tag);

            // ACT - get boss with all possible combinations
            var bossByIdWithModAndTag = await bossRepo.GetResourceById(bossId, true, true);
            var bossByIdWithMod = await bossRepo.GetResourceById(bossId, true, false);
            var bossByIdWithTag = await bossRepo.GetResourceById(bossId, false, true);
            var bossById = await bossRepo.GetResourceById(bossId, false, false);

            var bossByNameWithModAndTag = await bossRepo.GetBossByName(boss.Name, true, true);
            var bossByNameWithMod = await bossRepo.GetBossByName(boss.Name, true, false);
            var bossByNameWithTag = await bossRepo.GetBossByName(boss.Name, false, true);
            var bossByName = await bossRepo.GetBossByName(boss.Name, false, false);

            // ASSERT - make sure every version is correct
            bossByIdWithModAndTag.Id.Should().Be(boss.Id);
            bossByIdWithModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            bossByIdWithModAndTag.Tags[0].Id.Should().Be(tagId);
            bossByIdWithModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            bossByIdWithModAndTag.Color.Should().Be(boss.Color);
            bossByIdWithModAndTag.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossByIdWithModAndTag.ExistsIn.Should().Be(boss.ExistsIn);
            bossByIdWithModAndTag.GameMode.Should().Be(boss.GameMode);
            bossByIdWithModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            bossByIdWithModAndTag.W.Should().Be(boss.W);
            bossByIdWithModAndTag.X.Should().Be(boss.X);
            bossByIdWithModAndTag.Y.Should().Be(boss.Y);

            bossByIdWithMod.Id.Should().Be(boss.Id);
            bossByIdWithMod.Tags.Should().NotBeNull().And.BeEmpty();
            bossByIdWithMod.Color.Should().Be(boss.Color);
            bossByIdWithMod.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossByIdWithMod.ExistsIn.Should().Be(boss.ExistsIn);
            bossByIdWithMod.GameMode.Should().Be(boss.GameMode);
            bossByIdWithMod.Mod.Should().BeEquivalentTo(savedMod);
            bossByIdWithMod.W.Should().Be(boss.W);
            bossByIdWithMod.X.Should().Be(boss.X);
            bossByIdWithMod.Y.Should().Be(boss.Y);

            bossByIdWithTag.Id.Should().Be(boss.Id);
            bossByIdWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            bossByIdWithTag.Tags[0].Id.Should().Be(tagId);
            bossByIdWithTag.Tags[0].Effect.Should().Be(tag.Effect);
            bossByIdWithTag.Color.Should().Be(boss.Color);
            bossByIdWithTag.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossByIdWithTag.ExistsIn.Should().Be(boss.ExistsIn);
            bossByIdWithTag.GameMode.Should().Be(boss.GameMode);
            bossByIdWithTag.Mod.Should().BeNull();
            bossByIdWithTag.W.Should().Be(boss.W);
            bossByIdWithTag.X.Should().Be(boss.X);
            bossByIdWithTag.Y.Should().Be(boss.Y);

            bossById.Id.Should().Be(boss.Id);
            bossById.Tags.Should().NotBeNull().And.BeEmpty();
            bossById.Color.Should().Be(boss.Color);
            bossById.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossById.ExistsIn.Should().Be(boss.ExistsIn);
            bossById.GameMode.Should().Be(boss.GameMode);
            bossById.Mod.Should().BeNull();
            bossById.W.Should().Be(boss.W);
            bossById.X.Should().Be(boss.X);
            bossById.Y.Should().Be(boss.Y);

            bossByNameWithModAndTag.Id.Should().Be(boss.Id);
            bossByNameWithModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            bossByNameWithModAndTag.Tags[0].Id.Should().Be(tagId);
            bossByNameWithModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            bossByNameWithModAndTag.Color.Should().Be(boss.Color);
            bossByNameWithModAndTag.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossByNameWithModAndTag.ExistsIn.Should().Be(boss.ExistsIn);
            bossByNameWithModAndTag.GameMode.Should().Be(boss.GameMode);
            bossByNameWithModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            bossByNameWithModAndTag.W.Should().Be(boss.W);
            bossByNameWithModAndTag.X.Should().Be(boss.X);
            bossByNameWithModAndTag.Y.Should().Be(boss.Y);

            bossByNameWithMod.Id.Should().Be(boss.Id);
            bossByNameWithMod.Tags.Should().NotBeNull().And.BeEmpty();
            bossByNameWithMod.Color.Should().Be(boss.Color);
            bossByNameWithMod.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossByNameWithMod.ExistsIn.Should().Be(boss.ExistsIn);
            bossByNameWithMod.GameMode.Should().Be(boss.GameMode);
            bossByNameWithMod.Mod.Should().BeEquivalentTo(savedMod);
            bossByNameWithMod.W.Should().Be(boss.W);
            bossByNameWithMod.X.Should().Be(boss.X);
            bossByNameWithMod.Y.Should().Be(boss.Y);

            bossByNameWithTag.Id.Should().Be(boss.Id);
            bossByNameWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            bossByNameWithTag.Tags[0].Id.Should().Be(tagId);
            bossByNameWithTag.Tags[0].Effect.Should().Be(tag.Effect);
            bossByNameWithTag.Color.Should().Be(boss.Color);
            bossByNameWithTag.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossByNameWithTag.ExistsIn.Should().Be(boss.ExistsIn);
            bossByNameWithTag.GameMode.Should().Be(boss.GameMode);
            bossByNameWithTag.Mod.Should().BeNull();
            bossByNameWithTag.W.Should().Be(boss.W);
            bossByNameWithTag.X.Should().Be(boss.X);
            bossByNameWithTag.Y.Should().Be(boss.Y);

            bossByName.Id.Should().Be(boss.Id);
            bossByName.Tags.Should().NotBeNull().And.BeEmpty();
            bossByName.Color.Should().Be(boss.Color);
            bossByName.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossByName.ExistsIn.Should().Be(boss.ExistsIn);
            bossByName.GameMode.Should().Be(boss.GameMode);
            bossByName.Mod.Should().BeNull();
            bossByName.W.Should().Be(boss.W);
            bossByName.X.Should().Be(boss.X);
            bossByName.Y.Should().Be(boss.Y);
        }


        [Theory(DisplayName = "GetAllBosses can return a list of bosses with/without mods or tags"), AutoData]
        public async Task T3(SaveBossModel boss, SaveMod mod, AddModUrl url, AddTag tag)
        {
            // ARRANGE - create mod, boss, tag
            var bossRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            var modId = await modRepo.SaveMod(mod);
            boss.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            boss.FromMod = modId;
            var bossId = await bossRepo.SaveResource(boss);

            tag.ResourceId = bossId;
            var tagId = await bossRepo.AddTag(tag);

            // ACT - get bosses with all possible combinations
            var bossesWithModTag = await bossRepo.GetAllBosses(true, true);
            var bossesWithMod = await bossRepo.GetAllBosses(true, false);
            var bossesWithTag = await bossRepo.GetAllBosses(false, true);
            var bosses = await bossRepo.GetAllBosses(false, false);

            // ASSERT - make sure bosses get returned and the created boss correctly exists in the list
            bossesWithModTag.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            bossesWithMod.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            bossesWithTag.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            bosses.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);

            bossesWithModTag.Should().Contain(x => x.Id == bossId);
            bossesWithMod.Should().Contain(x => x.Id == bossId);
            bossesWithTag.Should().Contain(x => x.Id == bossId);
            bosses.Should().Contain(x => x.Id == bossId);

            var bossWithModAndTag = bossesWithModTag.First(x => x.Id == bossId);
            var bossWithMod = bossesWithMod.First(x => x.Id == bossId);
            var bossWithTag = bossesWithTag.First(x => x.Id == bossId);
            var bossOnly = bosses.First(x => x.Id == bossId);

            bossWithModAndTag.Id.Should().Be(boss.Id);
            bossWithModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            bossWithModAndTag.Tags[0].Id.Should().Be(tagId);
            bossWithModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            bossWithModAndTag.Color.Should().Be(boss.Color);
            bossWithModAndTag.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossWithModAndTag.ExistsIn.Should().Be(boss.ExistsIn);
            bossWithModAndTag.GameMode.Should().Be(boss.GameMode);
            bossWithModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            bossWithModAndTag.W.Should().Be(boss.W);
            bossWithModAndTag.X.Should().Be(boss.X);
            bossWithModAndTag.Y.Should().Be(boss.Y);
                
            bossWithMod.Id.Should().Be(boss.Id);
            bossWithMod.Tags.Should().NotBeNull().And.BeEmpty();
            bossWithMod.Color.Should().Be(boss.Color);
            bossWithMod.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossWithMod.ExistsIn.Should().Be(boss.ExistsIn);
            bossWithMod.GameMode.Should().Be(boss.GameMode);
            bossWithMod.Mod.Should().BeEquivalentTo(savedMod);
            bossWithMod.W.Should().Be(boss.W);
            bossWithMod.X.Should().Be(boss.X);
            bossWithMod.Y.Should().Be(boss.Y);
                
            bossWithTag.Id.Should().Be(boss.Id);
            bossWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            bossWithTag.Tags[0].Id.Should().Be(tagId);
            bossWithTag.Tags[0].Effect.Should().Be(tag.Effect);
            bossWithTag.Color.Should().Be(boss.Color);
            bossWithTag.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossWithTag.ExistsIn.Should().Be(boss.ExistsIn);
            bossWithTag.GameMode.Should().Be(boss.GameMode);
            bossWithTag.Mod.Should().BeNull();
            bossWithTag.W.Should().Be(boss.W);
            bossWithTag.X.Should().Be(boss.X);
            bossWithTag.Y.Should().Be(boss.Y);
                
            bossOnly.Id.Should().Be(boss.Id);
            bossOnly.Tags.Should().NotBeNull().And.BeEmpty();
            bossOnly.Color.Should().Be(boss.Color);
            bossOnly.DoubleTrouble.Should().Be(boss.DoubleTrouble);
            bossOnly.ExistsIn.Should().Be(boss.ExistsIn);
            bossOnly.GameMode.Should().Be(boss.GameMode);
            bossOnly.Mod.Should().BeNull();
            bossOnly.W.Should().Be(boss.W);
            bossOnly.X.Should().Be(boss.X);
            bossOnly.Y.Should().Be(boss.Y);
        }

        [Theory(DisplayName = "DeleteBoss can delete a boss and his tags"), AutoData]
        public async Task T4(SaveBossModel boss, AddTag tag)
        {
            // ARRANGE - create boss and tag
            var bossRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            boss.FromMod = null;
            var bossId = await bossRepo.SaveResource(boss);

            tag.ResourceId = bossId;
            var tagId = await bossRepo.AddTag(tag);

            // ACT - delete boss and try to read it back
            var deleteResult = await bossRepo.DeleteBoss(bossId);
            var deletedBoss = await bossRepo.GetResourceById(bossId, false, false);
            var deletedTag = await bossRepo.GetTagById(tagId);

            // ASSERT - boss and tags are gone
            deleteResult.Should().Be(1);
            deletedBoss.Should().BeNull();
            deletedTag.Should().BeNull();
        }
        
        [Theory(DisplayName = "GetBossTagById can return a boss tag"), AutoData]
        public async Task T5(SaveBossModel boss, AddTag tag)
        {
            // ARRANGE - create boss and tag
            var bossRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            boss.FromMod = null;
            var bossId = await bossRepo.SaveResource(boss);

            tag.ResourceId = bossId;
            var tagId = await bossRepo.AddTag(tag);

            // ACT - get tag by id
            var createdTag = await bossRepo.GetTagById(tagId);

            // ASSERT - tag is ok
            createdTag.Id.Should().Be(tagId);
            createdTag.Effect.Should().Be(tag.Effect);
        }

        [Theory(DisplayName = "GetBossTags can return tags for a boss"), AutoData]
        public async Task T6(SaveBossModel boss, AddTag tag1, AddTag tag2)
        {
            // ARRANGE - create boss and tags
            var bossRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            boss.FromMod = null;
            var bossId = await bossRepo.SaveResource(boss);

            tag1.ResourceId = bossId;
            tag2.ResourceId = bossId;
            var tag1Id = await bossRepo.AddTag(tag1);
            var tag2Id = await bossRepo.AddTag(tag2);

            // ACT - get tags
            var createdTags = await bossRepo.GetTags(bossId);

            // ASSERT - tags exist
            createdTags.Should().NotBeNullOrEmpty().And.HaveCount(2);
            createdTags[0].Id.Should().Be(tag1Id);
            createdTags[0].Effect.Should().Be(tag1.Effect);
            createdTags[1].Id.Should().Be(tag2Id);
            createdTags[1].Effect.Should().Be(tag2.Effect);
        }

        [Theory(DisplayName = "RemoveBossTag can remove a tag"), AutoData]
        public async Task T7(SaveBossModel boss, AddTag tag1, AddTag tag2)
        {
            // ARRANGE - create boss and tags
            var bossRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            boss.FromMod = null;
            var bossId = await bossRepo.SaveResource(boss);

            tag1.ResourceId = bossId;
            tag2.ResourceId = bossId;
            var tag1Id = await bossRepo.AddTag(tag1);
            var tag2Id = await bossRepo.AddTag(tag2);

            // ACT - delete first tag, read back boss
            var bossWithTwoTags = await bossRepo.GetResourceById(bossId, false, true);
            var deleteResult = await bossRepo.RemoveTag(tag1Id);
            var bossWithOneTagRemaining = await bossRepo.GetResourceById(bossId, false, true);

            // ASSERT - make sure boss had two tags, and now only has one
            deleteResult.Should().Be(1);

            bossWithTwoTags.Tags.Should().NotBeNullOrEmpty().And.HaveCount(2);
            bossWithOneTagRemaining.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);

            bossWithOneTagRemaining.Tags[0].Id.Should().Be(tag2Id);
            bossWithOneTagRemaining.Tags[0].Effect.Should().Be(tag2.Effect);
        }
    }
}
