using AutoFixture.Xunit2;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models.Validation;
using Website.Services;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Repositories
{
    [Collection("database_tests")]
    public class TransformationRepositoryTests
    {
        private readonly IntegrationtestFixture _fixture;

        public TransformationRepositoryTests(IntegrationtestFixture fixture)
        {
            _fixture = fixture;
        }

        [Theory(DisplayName = "SaveTransformation/GetById/GetByName can create and read a transformation by name/id, with and without mods and tags"), AutoData]
        public async Task T1(SaveTransformation transformation, SaveMod mod, AddModUrl url, AddTag tag)
        {
            // ARRANGE - create mod, transformation, tag
            var transformationRepo = _fixture.TestServer.Host.Services.GetService(typeof(ITransformationRepository)) as ITransformationRepository;
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            var modId = await modRepo.SaveMod(mod);
            transformation.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            transformation.FromMod = modId;
            var transformationId = await transformationRepo.SaveTransformation(transformation);

            tag.ResourceId = transformationId;
            var tagId = await transformationRepo.AddTag(tag);

            // ACT - get transformation with all possible combinations
            var transformationByIdWithModAndTag = await transformationRepo.GetTransformationById(transformationId, true, true);
            var transformationByIdWithMod = await transformationRepo.GetTransformationById(transformationId, true, false);
            var transformationByIdWithTag = await transformationRepo.GetTransformationById(transformationId, false, true);
            var transformationById = await transformationRepo.GetTransformationById(transformationId, false, false);

            var transformationByNameWithModAndTag = await transformationRepo.GetTransformationByName(transformation.Name, true, true);
            var transformationByNameWithMod = await transformationRepo.GetTransformationByName(transformation.Name, true, false);
            var transformationByNameWithTag = await transformationRepo.GetTransformationByName(transformation.Name, false, true);
            var transformationByName = await transformationRepo.GetTransformationByName(transformation.Name, false, false);

            // ASSERT - make sure every version is correct
            transformationByIdWithModAndTag.Id.Should().Be(transformation.Id);
            transformationByIdWithModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            transformationByIdWithModAndTag.Tags[0].Id.Should().Be(tagId);
            transformationByIdWithModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            transformationByIdWithModAndTag.Color.Should().Be(transformation.Color);
            transformationByIdWithModAndTag.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationByIdWithModAndTag.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationByIdWithModAndTag.GameMode.Should().Be(transformation.GameMode);
            transformationByIdWithModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            transformationByIdWithModAndTag.W.Should().Be(transformation.W);
            transformationByIdWithModAndTag.X.Should().Be(transformation.X);
            transformationByIdWithModAndTag.Y.Should().Be(transformation.Y);

            transformationByIdWithMod.Id.Should().Be(transformation.Id);
            transformationByIdWithMod.Tags.Should().NotBeNull().And.BeEmpty();
            transformationByIdWithMod.Color.Should().Be(transformation.Color);
            transformationByIdWithMod.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationByIdWithMod.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationByIdWithMod.GameMode.Should().Be(transformation.GameMode);
            transformationByIdWithMod.Mod.Should().BeEquivalentTo(savedMod);
            transformationByIdWithMod.W.Should().Be(transformation.W);
            transformationByIdWithMod.X.Should().Be(transformation.X);
            transformationByIdWithMod.Y.Should().Be(transformation.Y);

            transformationByIdWithTag.Id.Should().Be(transformation.Id);
            transformationByIdWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            transformationByIdWithTag.Tags[0].Id.Should().Be(tagId);
            transformationByIdWithTag.Tags[0].Effect.Should().Be(tag.Effect);
            transformationByIdWithTag.Color.Should().Be(transformation.Color);
            transformationByIdWithTag.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationByIdWithTag.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationByIdWithTag.GameMode.Should().Be(transformation.GameMode);
            transformationByIdWithTag.Mod.Should().BeNull();
            transformationByIdWithTag.W.Should().Be(transformation.W);
            transformationByIdWithTag.X.Should().Be(transformation.X);
            transformationByIdWithTag.Y.Should().Be(transformation.Y);

            transformationById.Id.Should().Be(transformation.Id);
            transformationById.Tags.Should().NotBeNull().And.BeEmpty();
            transformationById.Color.Should().Be(transformation.Color);
            transformationById.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationById.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationById.GameMode.Should().Be(transformation.GameMode);
            transformationById.Mod.Should().BeNull();
            transformationById.W.Should().Be(transformation.W);
            transformationById.X.Should().Be(transformation.X);
            transformationById.Y.Should().Be(transformation.Y);

            transformationByNameWithModAndTag.Id.Should().Be(transformation.Id);
            transformationByNameWithModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            transformationByNameWithModAndTag.Tags[0].Id.Should().Be(tagId);
            transformationByNameWithModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            transformationByNameWithModAndTag.Color.Should().Be(transformation.Color);
            transformationByNameWithModAndTag.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationByNameWithModAndTag.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationByNameWithModAndTag.GameMode.Should().Be(transformation.GameMode);
            transformationByNameWithModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            transformationByNameWithModAndTag.W.Should().Be(transformation.W);
            transformationByNameWithModAndTag.X.Should().Be(transformation.X);
            transformationByNameWithModAndTag.Y.Should().Be(transformation.Y);

            transformationByNameWithMod.Id.Should().Be(transformation.Id);
            transformationByNameWithMod.Tags.Should().NotBeNull().And.BeEmpty();
            transformationByNameWithMod.Color.Should().Be(transformation.Color);
            transformationByNameWithMod.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationByNameWithMod.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationByNameWithMod.GameMode.Should().Be(transformation.GameMode);
            transformationByNameWithMod.Mod.Should().BeEquivalentTo(savedMod);
            transformationByNameWithMod.W.Should().Be(transformation.W);
            transformationByNameWithMod.X.Should().Be(transformation.X);
            transformationByNameWithMod.Y.Should().Be(transformation.Y);

            transformationByNameWithTag.Id.Should().Be(transformation.Id);
            transformationByNameWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            transformationByNameWithTag.Tags[0].Id.Should().Be(tagId);
            transformationByNameWithTag.Tags[0].Effect.Should().Be(tag.Effect);
            transformationByNameWithTag.Color.Should().Be(transformation.Color);
            transformationByNameWithTag.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationByNameWithTag.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationByNameWithTag.GameMode.Should().Be(transformation.GameMode);
            transformationByNameWithTag.Mod.Should().BeNull();
            transformationByNameWithTag.W.Should().Be(transformation.W);
            transformationByNameWithTag.X.Should().Be(transformation.X);
            transformationByNameWithTag.Y.Should().Be(transformation.Y);

            transformationByName.Id.Should().Be(transformation.Id);
            transformationByName.Tags.Should().NotBeNull().And.BeEmpty();
            transformationByName.Color.Should().Be(transformation.Color);
            transformationByName.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationByName.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationByName.GameMode.Should().Be(transformation.GameMode);
            transformationByName.Mod.Should().BeNull();
            transformationByName.W.Should().Be(transformation.W);
            transformationByName.X.Should().Be(transformation.X);
            transformationByName.Y.Should().Be(transformation.Y);
        }

        [Theory(DisplayName = "GetAllTransformations can return a list of transformations with/without mods or tags"), AutoData]
        public async Task T2(SaveTransformation transformation, SaveMod mod, AddModUrl url, AddTag tag)
        {
            // ARRANGE - create mod, transformation, tag
            var transformationRepo = _fixture.TestServer.Host.Services.GetService(typeof(ITransformationRepository)) as ITransformationRepository;
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            var modId = await modRepo.SaveMod(mod);
            transformation.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            transformation.FromMod = modId;
            var transformationId = await transformationRepo.SaveTransformation(transformation);

            tag.ResourceId = transformationId;
            var tagId = await transformationRepo.AddTag(tag);

            // ACT - get transformations with all possible combinations
            var transformationsWithModTag = await transformationRepo.GetAllTransformations(true, true);
            var transformationsWithMod = await transformationRepo.GetAllTransformations(true, false);
            var transformationsWithTag = await transformationRepo.GetAllTransformations(false, true);
            var transformationsOnly = await transformationRepo.GetAllTransformations(false, false);

            // ASSERT - make sure transformations get returned and the created transformation correctly exists in the list
            transformationsWithModTag.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            transformationsWithMod.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            transformationsWithTag.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            transformationsOnly.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);

            transformationsWithModTag.Should().Contain(x => x.Id == transformationId);
            transformationsWithMod.Should().Contain(x => x.Id == transformationId);
            transformationsWithTag.Should().Contain(x => x.Id == transformationId);
            transformationsOnly.Should().Contain(x => x.Id == transformationId);

            var transformationWithModAndTag = transformationsWithModTag.First(x => x.Id == transformationId);
            var transformationWithMod = transformationsWithMod.First(x => x.Id == transformationId);
            var transformationWithTag = transformationsWithTag.First(x => x.Id == transformationId);
            var transformationOnly = transformationsOnly.First(x => x.Id == transformationId);

            transformationWithModAndTag.Id.Should().Be(transformation.Id);
            transformationWithModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            transformationWithModAndTag.Tags[0].Id.Should().Be(tagId);
            transformationWithModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            transformationWithModAndTag.Color.Should().Be(transformation.Color);
            transformationWithModAndTag.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationWithModAndTag.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationWithModAndTag.GameMode.Should().Be(transformation.GameMode);
            transformationWithModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            transformationWithModAndTag.W.Should().Be(transformation.W);
            transformationWithModAndTag.X.Should().Be(transformation.X);
            transformationWithModAndTag.Y.Should().Be(transformation.Y);

            transformationWithMod.Id.Should().Be(transformation.Id);
            transformationWithMod.Tags.Should().NotBeNull().And.BeEmpty();
            transformationWithMod.Color.Should().Be(transformation.Color);
            transformationWithMod.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationWithMod.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationWithMod.GameMode.Should().Be(transformation.GameMode);
            transformationWithMod.Mod.Should().BeEquivalentTo(savedMod);
            transformationWithMod.W.Should().Be(transformation.W);
            transformationWithMod.X.Should().Be(transformation.X);
            transformationWithMod.Y.Should().Be(transformation.Y);

            transformationWithTag.Id.Should().Be(transformation.Id);
            transformationWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            transformationWithTag.Tags[0].Id.Should().Be(tagId);
            transformationWithTag.Tags[0].Effect.Should().Be(tag.Effect);
            transformationWithTag.Color.Should().Be(transformation.Color);
            transformationWithTag.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationWithTag.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationWithTag.GameMode.Should().Be(transformation.GameMode);
            transformationWithTag.Mod.Should().BeNull();
            transformationWithTag.W.Should().Be(transformation.W);
            transformationWithTag.X.Should().Be(transformation.X);
            transformationWithTag.Y.Should().Be(transformation.Y);

            transformationOnly.Id.Should().Be(transformation.Id);
            transformationOnly.Tags.Should().NotBeNull().And.BeEmpty();
            transformationOnly.Color.Should().Be(transformation.Color);
            transformationOnly.StepsNeeded.Should().Be(transformation.StepsNeeded);
            transformationOnly.ExistsIn.Should().Be(transformation.ExistsIn);
            transformationOnly.GameMode.Should().Be(transformation.GameMode);
            transformationOnly.Mod.Should().BeNull();
            transformationOnly.W.Should().Be(transformation.W);
            transformationOnly.X.Should().Be(transformation.X);
            transformationOnly.Y.Should().Be(transformation.Y);
        }

        [Theory(DisplayName = "DeleteTransformation can delete a transformation and its tags"), AutoData]
        public async Task T4(SaveTransformation transformation, AddTag tag)
        {
            // ARRANGE - create transformation and tag
            var transformationRepo = _fixture.TestServer.Host.Services.GetService(typeof(ITransformationRepository)) as ITransformationRepository;

            transformation.FromMod = null;
            var transformationId = await transformationRepo.SaveTransformation(transformation);

            tag.ResourceId = transformationId;
            var tagId = await transformationRepo.AddTag(tag);

            // ACT - delete transformation and try to read it back
            var deleteResult = await transformationRepo.DeleteTransformation(transformationId);
            var deletedTransformation = await transformationRepo.GetTransformationById(transformationId, false, false);
            var deletedTag = await transformationRepo.GetTransformationTagById(tagId);

            // ASSERT - transformation and tags are gone
            deleteResult.Should().Be(1);
            deletedTransformation.Should().BeNull();
            deletedTag.Should().BeNull();
        }

        [Theory(DisplayName = "GetTransformationTagById can return a transformation tag"), AutoData]
        public async Task T5(SaveTransformation transformation, AddTag tag)
        {
            // ARRANGE - create transformation and tag
            var transformationRepo = _fixture.TestServer.Host.Services.GetService(typeof(ITransformationRepository)) as ITransformationRepository;

            transformation.FromMod = null;
            var transformationId = await transformationRepo.SaveTransformation(transformation);

            tag.ResourceId = transformationId;
            var tagId = await transformationRepo.AddTag(tag);

            // ACT - get tag by id
            var createdTag = await transformationRepo.GetTransformationTagById(tagId);

            // ASSERT - tag is ok
            createdTag.Id.Should().Be(tagId);
            createdTag.Effect.Should().Be(tag.Effect);
        }

        [Theory(DisplayName = "GetTransformationTags can return tags for a transformation"), AutoData]
        public async Task T6(SaveTransformation transformation, AddTag tag1, AddTag tag2)
        {
            // ARRANGE - create transformation and tags
            var transformationRepo = _fixture.TestServer.Host.Services.GetService(typeof(ITransformationRepository)) as ITransformationRepository;

            transformation.FromMod = null;
            var transformationId = await transformationRepo.SaveTransformation(transformation);

            tag1.ResourceId = transformationId;
            tag2.ResourceId = transformationId;
            var tag1Id = await transformationRepo.AddTag(tag1);
            var tag2Id = await transformationRepo.AddTag(tag2);

            // ACT - get tags
            var createdTags = await transformationRepo.GetTransformationTags(transformationId);

            // ASSERT - tags exist
            createdTags.Should().NotBeNullOrEmpty().And.HaveCount(2);
            createdTags[0].Id.Should().Be(tag1Id);
            createdTags[0].Effect.Should().Be(tag1.Effect);
            createdTags[1].Id.Should().Be(tag2Id);
            createdTags[1].Effect.Should().Be(tag2.Effect);
        }

        [Theory(DisplayName = "RemoveTransformationTag can remove a tag"), AutoData]
        public async Task T7(SaveTransformation transformation, AddTag tag1, AddTag tag2)
        {
            // ARRANGE - create transformation and tags
            var transformationRepo = _fixture.TestServer.Host.Services.GetService(typeof(ITransformationRepository)) as ITransformationRepository;

            transformation.FromMod = null;
            var transformationId = await transformationRepo.SaveTransformation(transformation);

            tag1.ResourceId = transformationId;
            tag2.ResourceId = transformationId;
            var tag1Id = await transformationRepo.AddTag(tag1);
            var tag2Id = await transformationRepo.AddTag(tag2);

            // ACT - delete first tag, read back transformation
            var transformationWithTwoTags = await transformationRepo.GetTransformationById(transformationId, false, true);
            var deleteResult = await transformationRepo.RemoveTransformationTag(tag1Id);
            var transformationWithOneTagRemaining = await transformationRepo.GetTransformationById(transformationId, false, true);

            // ASSERT - make sure transformation had two tags, and now only has one
            deleteResult.Should().Be(1);

            transformationWithTwoTags.Tags.Should().NotBeNullOrEmpty().And.HaveCount(2);
            transformationWithOneTagRemaining.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);

            transformationWithOneTagRemaining.Tags[0].Id.Should().Be(tag2Id);
            transformationWithOneTagRemaining.Tags[0].Effect.Should().Be(tag2.Effect);
        }
    }
}
