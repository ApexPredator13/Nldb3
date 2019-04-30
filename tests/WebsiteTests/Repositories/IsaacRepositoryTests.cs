using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Moq;
using System;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Models.Database.Enums;
using Website.Models.Validation;
using Website.Services;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Repositories
{
    [Collection("database_tests")]
    public class IsaacRepositoryTests
    {
        private readonly DatabaseTestFixture _fixture;
        private readonly IFixture _f;

        public IsaacRepositoryTests(DatabaseTestFixture fixture)
        {
            _fixture = fixture;
            _f = new Fixture();
            _f.Register<IFormFile>(() => new Mock<IFormFile>().Object);
        }

        [Theory(DisplayName = "SaveResource/GetById can create and read a resource with/-out mods and tags"), AutoDataMoq]
        public async Task T1(CreateIsaacResource item, CreateMod mod, CreateModLink url, AddTag tag)
        {
            // ARRANGE - create mod, transformation, tag
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            var modId = await modRepo.SaveMod(mod);
            item.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            item.FromMod = modId;
            var resourceId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            tag.ResourceId = resourceId;
            var tagId = await isaacRepo.AddTag(tag);

            // ACT - get transformation with all possible combinations
            var withModAndTag = await isaacRepo.GetResourceById(resourceId, true, true);
            var withMod = await isaacRepo.GetResourceById(resourceId, true, false);
            var withTag = await isaacRepo.GetResourceById(resourceId, false, true);
            var withNothing = await isaacRepo.GetResourceById(resourceId, false, false);

            // ASSERT - make sure every version is correct
            withModAndTag.Id.Should().Be(item.Id);
            withModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            withModAndTag.Tags[0].Id.Should().Be(tagId);
            withModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            withModAndTag.Color.Should().Be(item.Color);
            withModAndTag.ExistsIn.Should().Be(item.ExistsIn);
            withModAndTag.GameMode.Should().Be(item.GameMode);
            withModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            withModAndTag.W.Should().Be(3);
            withModAndTag.X.Should().Be(1);
            withModAndTag.Y.Should().Be(2);
            withModAndTag.H.Should().Be(4);
            withModAndTag.Difficulty.Should().Be(item.Difficulty);
            withModAndTag.DisplayOrder.Should().Be(item.DisplayOrder);
            withModAndTag.ResourceType.Should().Be(item.ResourceType);

            withMod.Id.Should().Be(item.Id);
            withMod.Tags.Should().NotBeNull().And.BeEmpty();
            withMod.Color.Should().Be(item.Color);
            withMod.ExistsIn.Should().Be(item.ExistsIn);
            withMod.GameMode.Should().Be(item.GameMode);
            withMod.Mod.Should().BeEquivalentTo(savedMod);
            withMod.W.Should().Be(3);
            withMod.X.Should().Be(1);
            withMod.Y.Should().Be(2);
            withMod.H.Should().Be(4);
            withMod.Difficulty.Should().Be(item.Difficulty);
            withMod.DisplayOrder.Should().Be(item.DisplayOrder);
            withMod.ResourceType.Should().Be(item.ResourceType);

            withTag.Id.Should().Be(item.Id);
            withTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            withTag.Tags[0].Id.Should().Be(tagId);
            withTag.Tags[0].Effect.Should().Be(tag.Effect);
            withTag.Color.Should().Be(item.Color);
            withTag.ExistsIn.Should().Be(item.ExistsIn);
            withTag.GameMode.Should().Be(item.GameMode);
            withTag.Mod.Should().BeNull();
            withTag.W.Should().Be(3);
            withTag.X.Should().Be(1);
            withTag.Y.Should().Be(2);
            withTag.H.Should().Be(4);
            withTag.Difficulty.Should().Be(item.Difficulty);
            withTag.DisplayOrder.Should().Be(item.DisplayOrder);
            withTag.ResourceType.Should().Be(item.ResourceType);

            withNothing.Id.Should().Be(item.Id);
            withNothing.Tags.Should().NotBeNull().And.BeEmpty();
            withNothing.Color.Should().Be(item.Color);
            withNothing.ExistsIn.Should().Be(item.ExistsIn);
            withNothing.GameMode.Should().Be(item.GameMode);
            withNothing.Mod.Should().BeNull();
            withNothing.W.Should().Be(3);
            withNothing.X.Should().Be(1);
            withNothing.Y.Should().Be(2);
            withNothing.H.Should().Be(4);
            withNothing.Difficulty.Should().Be(item.Difficulty);
            withNothing.DisplayOrder.Should().Be(item.DisplayOrder);
            withNothing.ResourceType.Should().Be(item.ResourceType);
        }

        [Theory(DisplayName = "GetResources can return a list of resources with/without mods or tags"), AutoDataMoq]
        public async Task T2(CreateIsaacResource item, CreateMod mod, CreateModLink url, AddTag tag, GetResource getAllRequest, GetResource getModsRequest, GetResource getTagsRequest, GetResource getNothingRequest)
        {
            // ARRANGE - create mod, resource, tag, prepare requests
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            var modId = await modRepo.SaveMod(mod);
            item.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            item.FromMod = modId;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            tag.ResourceId = itemId;
            var tagId = await isaacRepo.AddTag(tag);

            getAllRequest.IncludeMod = true;
            getAllRequest.IncludeTags = true;
            getAllRequest.ResourceType = item.ResourceType;
            getAllRequest.RequiredTags.Clear();
            getAllRequest.RequiredTags.Add(tag.Effect);

            getModsRequest.IncludeMod = true;
            getModsRequest.IncludeTags = false;
            getModsRequest.ResourceType = item.ResourceType;
            getModsRequest.RequiredTags.Clear();
            getModsRequest.RequiredTags.Add(tag.Effect);

            getTagsRequest.IncludeMod = false;
            getTagsRequest.IncludeTags = true;
            getTagsRequest.ResourceType = item.ResourceType;
            getTagsRequest.RequiredTags.Clear();
            getTagsRequest.RequiredTags.Add(tag.Effect);

            getNothingRequest.IncludeMod = false;
            getNothingRequest.IncludeTags = false;
            getNothingRequest.ResourceType = item.ResourceType;
            getNothingRequest.RequiredTags.Clear();
            getNothingRequest.RequiredTags.Add(tag.Effect);

            // ACT - get resources with all possible combinations
            var withAll = await isaacRepo.GetResources(getAllRequest);
            var withMod = await isaacRepo.GetResources(getModsRequest);
            var withTag = await isaacRepo.GetResources(getTagsRequest);
            var withNothing = await isaacRepo.GetResources(getNothingRequest);

            // ASSERT - make sure a list of resources gets returned and the created item correctly exists in the list
            withAll.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            withMod.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            withTag.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);
            withNothing.Should().NotBeNullOrEmpty().And.HaveCountGreaterOrEqualTo(1);

            withAll.Should().Contain(x => x.Id == itemId);
            withMod.Should().Contain(x => x.Id == itemId);
            withTag.Should().Contain(x => x.Id == itemId);
            withNothing.Should().Contain(x => x.Id == itemId);

            var itemWithModAndTag = withAll.First(x => x.Id == itemId);
            var itemWithMod = withMod.First(x => x.Id == itemId);
            var itemWithTag = withTag.First(x => x.Id == itemId);
            var itemWithNothing = withNothing.First(x => x.Id == itemId);

            itemWithModAndTag.Id.Should().Be(item.Id);
            itemWithModAndTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            itemWithModAndTag.Tags[0].Id.Should().Be(tagId);
            itemWithModAndTag.Tags[0].Effect.Should().Be(tag.Effect);
            itemWithModAndTag.Color.Should().Be(item.Color);
            itemWithModAndTag.ExistsIn.Should().Be(item.ExistsIn);
            itemWithModAndTag.GameMode.Should().Be(item.GameMode);
            itemWithModAndTag.Mod.Should().BeEquivalentTo(savedMod);
            itemWithModAndTag.W.Should().Be(3);
            itemWithModAndTag.X.Should().Be(1);
            itemWithModAndTag.Y.Should().Be(2);
            itemWithModAndTag.H.Should().Be(4);
            itemWithModAndTag.Difficulty.Should().Be(item.Difficulty);
            itemWithModAndTag.DisplayOrder.Should().Be(item.DisplayOrder);
            itemWithModAndTag.ResourceType.Should().Be(item.ResourceType);

            itemWithMod.Id.Should().Be(item.Id);
            itemWithMod.Tags.Should().NotBeNull().And.BeEmpty();
            itemWithMod.Color.Should().Be(item.Color);
            itemWithMod.ExistsIn.Should().Be(item.ExistsIn);
            itemWithMod.GameMode.Should().Be(item.GameMode);
            itemWithMod.Mod.Should().BeEquivalentTo(savedMod);
            itemWithMod.W.Should().Be(3);
            itemWithMod.X.Should().Be(1);
            itemWithMod.Y.Should().Be(2);
            itemWithMod.H.Should().Be(4);
            itemWithMod.Difficulty.Should().Be(item.Difficulty);
            itemWithMod.DisplayOrder.Should().Be(item.DisplayOrder);
            itemWithMod.ResourceType.Should().Be(item.ResourceType);

            itemWithTag.Id.Should().Be(item.Id);
            itemWithTag.Tags.Should().NotBeNullOrEmpty().And.HaveCount(1);
            itemWithTag.Tags[0].Id.Should().Be(tagId);
            itemWithTag.Tags[0].Effect.Should().Be(tag.Effect);
            itemWithTag.Color.Should().Be(item.Color);
            itemWithTag.ExistsIn.Should().Be(item.ExistsIn);
            itemWithTag.GameMode.Should().Be(item.GameMode);
            itemWithTag.Mod.Should().BeNull();
            itemWithTag.W.Should().Be(3);
            itemWithTag.X.Should().Be(1);
            itemWithTag.Y.Should().Be(2);
            itemWithTag.H.Should().Be(4);
            itemWithTag.Difficulty.Should().Be(item.Difficulty);
            itemWithTag.DisplayOrder.Should().Be(item.DisplayOrder);
            itemWithTag.ResourceType.Should().Be(item.ResourceType);

            itemWithNothing.Id.Should().Be(item.Id);
            itemWithNothing.Tags.Should().NotBeNull().And.BeEmpty();
            itemWithNothing.Color.Should().Be(item.Color);
            itemWithNothing.ExistsIn.Should().Be(item.ExistsIn);
            itemWithNothing.GameMode.Should().Be(item.GameMode);
            itemWithNothing.Mod.Should().BeNull();
            itemWithNothing.W.Should().Be(3);
            itemWithNothing.X.Should().Be(1);
            itemWithNothing.Y.Should().Be(2);
            itemWithNothing.H.Should().Be(4);
            itemWithNothing.Difficulty.Should().Be(item.Difficulty);
            itemWithNothing.DisplayOrder.Should().Be(item.DisplayOrder);
            itemWithNothing.ResourceType.Should().Be(item.ResourceType);
        }

        [Theory(DisplayName = "DeleteResource can delete a resource (including its tags)"), AutoDataMoq]
        public async Task T3(CreateIsaacResource item, AddTag tag)
        {
            // ARRANGE - create item and tag
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            tag.ResourceId = itemId;
            var tagId = await isaacRepo.AddTag(tag);

            // ACT - get item, delete it, then get it again to check if it's gone now
            var stillExistingItem = await isaacRepo.GetResourceById(itemId, false, true);
            var stillExistingTag = await isaacRepo.GetTagById(tagId);

            int deleteResult = await isaacRepo.DeleteResource(itemId);

            var deletedItem = await isaacRepo.GetResourceById(itemId, false, true);
            var deletedTag = await isaacRepo.GetTagById(tagId);

            // ASSERT - make sure items existed, but are now null
            stillExistingItem.Should().NotBeNull();
            stillExistingTag.Should().NotBeNull();

            deleteResult.Should().Be(1);

            deletedItem.Should().BeNull();
            deletedTag.Should().BeNull();
        }

        [Theory(DisplayName = "GetTags can return a list of tags for a resource"), AutoDataMoq]
        public async Task T4(CreateIsaacResource item, AddTag tag1, AddTag tag2, AddTag tag3)
        {
            // ARRANGE - create item and tags
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            tag1.ResourceId = itemId;
            tag2.ResourceId = itemId;
            tag3.ResourceId = itemId;
            var tag1Id = await isaacRepo.AddTag(tag1);
            var tag2Id = await isaacRepo.AddTag(tag2);
            var tag3Id = await isaacRepo.AddTag(tag3);

            // ACT - get tags
            var tags = await isaacRepo.GetTags(itemId);

            // ASSERT - make sure all tags exist
            tags.Should().NotBeNullOrEmpty().And.HaveCount(3);
            tags[0].Id.Should().Be(tag1Id);
            tags[1].Id.Should().Be(tag2Id);
            tags[2].Id.Should().Be(tag3Id);
            tags[0].Effect.Should().Be(tag1.Effect);
            tags[1].Effect.Should().Be(tag2.Effect);
            tags[2].Effect.Should().Be(tag3.Effect);
        }

        [Theory(DisplayName = "RemoveTag can remove a single tag"), AutoDataMoq]
        public async Task T5(CreateIsaacResource item, AddTag tag1, AddTag tag2, AddTag tag3)
        {
            // ARRANGE - create item and tags
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            tag1.ResourceId = itemId;
            tag2.ResourceId = itemId;
            tag3.ResourceId = itemId;
            var tag1Id = await isaacRepo.AddTag(tag1);
            var tag2Id = await isaacRepo.AddTag(tag2);
            var tag3Id = await isaacRepo.AddTag(tag3);

            // ACT - get tags, remove the middle one, then get tags again
            var tagsBefore = await isaacRepo.GetTags(itemId);
            var deleteResult = await isaacRepo.RemoveTag(tag2Id);
            var tagsAfter = await isaacRepo.GetTags(itemId);

            // ASSERT - make sure the middle tag is gone now
            tagsBefore.Should().NotBeNullOrEmpty().And.HaveCount(3);
            deleteResult.Should().Be(1);

            tagsAfter.Should().NotBeNullOrEmpty().And.HaveCount(2);
            tagsAfter[0].Id.Should().Be(tag1Id);
            tagsAfter[1].Id.Should().Be(tag3Id);
            tagsAfter[0].Effect.Should().Be(tag1.Effect);
            tagsAfter[1].Effect.Should().Be(tag3.Effect);
        }

        [Theory(DisplayName = "MakeTransformative/GetTransformationData can add transformation data and read it back"), AutoDataMoq]
        public async Task T6(CreateIsaacResource item, MakeIsaacResourceTransformative data)
        {
            // ARRANGE - create item, add it to 'MissingTransformation' because that always exists
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            data.TransformationId = "MissingTransformation";
            data.ResourceId = itemId;
            data.ValidFrom = DateTime.Now - TimeSpan.FromHours(1);
            data.ValidUntil = DateTime.Now + TimeSpan.FromHours(1);

            // ACT - create entry
            var dataId = await isaacRepo.MakeTransformative(data);
            var createdData = await isaacRepo.GetTransformationData(itemId, data.RequiresTitleContent, DateTime.Now);

            // ASSERT - make sure it's returned correctly
            dataId.Should().BeGreaterOrEqualTo(1);
            createdData.Should().NotBeNullOrEmpty().And.HaveCount(1);
            createdData[0].stepsNeeded.Should().Be(data.StepsNeeded);
            createdData[0].transformation.Should().Be("MissingTransformation");
            createdData[0].countsMultipleTimes.Should().Be(data.CanCountMultipleTimes);
        }

        [Theory(DisplayName = "GetTransformationData returns nothing if required title content doesn't match"), AutoDataMoq]
        public async Task T7(CreateIsaacResource item, MakeIsaacResourceTransformative data)
        {
            // ARRANGE - create item, add it to 'MissingTransformation' because that always exists
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            data.TransformationId = "MissingTransformation";
            data.ResourceId = itemId;
            data.ValidFrom = DateTime.Now - TimeSpan.FromHours(1);
            data.ValidUntil = DateTime.Now + TimeSpan.FromHours(1);

            // ACT - create entry, read back with invalid title content
            var dataId = await isaacRepo.MakeTransformative(data);
            var createdData = await isaacRepo.GetTransformationData(itemId, "invalid!", DateTime.Now);

            // ASSERT - make sure nothing is returned
            dataId.Should().BeGreaterOrEqualTo(1);
            createdData.Should().BeEmpty();
        }

        [Theory(DisplayName = "GetTransformationData returns nothing if it expired"), AutoDataMoq]
        public async Task T8(CreateIsaacResource item, MakeIsaacResourceTransformative data)
        {
            // ARRANGE - create item, add it to 'MissingTransformation' because that always exists
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            data.TransformationId = "MissingTransformation";
            data.ResourceId = itemId;
            data.ValidFrom = DateTime.Now - TimeSpan.FromHours(2);
            data.ValidUntil = DateTime.Now - TimeSpan.FromHours(1); // expired 1 hour ago

            // ACT - create entry, read back
            var dataId = await isaacRepo.MakeTransformative(data);
            var createdData = await isaacRepo.GetTransformationData(itemId, data.RequiresTitleContent, DateTime.Now);

            // ASSERT - make sure nothing is returned
            dataId.Should().BeGreaterOrEqualTo(1);
            createdData.Should().BeEmpty();
        }

        [Theory(DisplayName = "GetTransformationData returns nothing if it isn't valid yet"), AutoDataMoq]
        public async Task T9(CreateIsaacResource item, MakeIsaacResourceTransformative data)
        {
            // ARRANGE - create item, add it to 'MissingTransformation' because that always exists
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            data.TransformationId = "MissingTransformation";
            data.ResourceId = itemId;
            data.ValidFrom = DateTime.Now + TimeSpan.FromHours(1);  // valid 1 hour from now
            data.ValidUntil = DateTime.Now + TimeSpan.FromHours(2);

            // ACT - create entry, read back with invalid title content
            var dataId = await isaacRepo.MakeTransformative(data);
            var createdData = await isaacRepo.GetTransformationData(itemId, data.RequiresTitleContent, DateTime.Now);

            // ASSERT - make sure nothing is returned
            dataId.Should().BeGreaterOrEqualTo(1);
            createdData.Should().BeEmpty();
        }

        [Theory(DisplayName = "IsSpacebarItem returns true / false if spacebar tag exists / doesn't exist"), AutoDataMoq]
        public async Task T10(CreateIsaacResource item)
        {
            // ARRANGE - create item
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            // ACT - check if item is spacebar item, add spacebar item tag, then check again
            var isSpacebarItemBefore = await isaacRepo.IsSpacebarItem(itemId);
            var _ = await isaacRepo.AddTag(new AddTag { Effect = Effect.IsSpacebarItem, ResourceId = itemId });
            var isSpacebarItemAfter = await isaacRepo.IsSpacebarItem(itemId);

            // ASSERT
            isSpacebarItemBefore.Should().BeFalse();
            isSpacebarItemAfter.Should().BeTrue();
        }

        [Theory(DisplayName = "UpdateName can change a resource name"), AutoDataMoq]
        public async Task T11(CreateIsaacResource item)
        {
            // ARRANGE - create item
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            // ACT - get name, change name, get name again
            var nameBefore = (await isaacRepo.GetResourceById(itemId, false, false)).Name;
            var updateChange = await isaacRepo.UpdateName(itemId, "NEW NAME");
            var nameAfter = (await isaacRepo.GetResourceById(itemId, false, false)).Name;

            // ASSERT
            nameBefore.Should().Be(item.Name);
            updateChange.Should().Be(1);
            nameAfter.Should().Be("NEW NAME");
        }

        [Theory(DisplayName = "UpdateId can change a resource id"), AutoDataMoq]
        public async Task T12(CreateIsaacResource item)
        {
            // ARRANGE - create item
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 1, 2, 3, 4);

            // ACT - get id, change id, get id again
            var updateChange = await isaacRepo.UpdateId(itemId, "NEW_ID");
            var resourceWithNewId = await isaacRepo.GetResourceById("NEW_ID", false, false);

            // ASSERT
            updateChange.Should().Be(1);
            resourceWithNewId.Should().NotBeNull();
            resourceWithNewId.Id.Should().Be("NEW_ID");
        }

        [Theory(DisplayName = "CoordinatesAreTaken can tell if resource image bounding box is overlapped by requested coordinates"), AutoDataMoq]
        public async Task T13(CreateIsaacResource item)
        {
            // ARRANGE - create item - icon of the item starts at 1000x1000 and is 30 pixels wide and high
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var _ = await isaacRepo.SaveResource(item, 1000, 1000, 30, 30);

            // ACT
            var overlapsExact = await isaacRepo.CoordinatesAreTaken(1000, 1000, 20, 20);                // same origin, but shorter
            var overlapsPartiallyMiddle = await isaacRepo.CoordinatesAreTaken(1015, 1015, 30, 30);      // same size, starts in the middle of the rectangle
            var overlapsLastPixel = await isaacRepo.CoordinatesAreTaken(1029, 1029, 30, 30);            // same size, overlaps only the last pixel

            var toTheRight = await isaacRepo.CoordinatesAreTaken(1030, 1000, 30, 30);                   // rectangle starts exactly at the right border
            var toTheLeft = await isaacRepo.CoordinatesAreTaken(970, 1000, 30, 30);                     // rectangle ends directly at the left border
            var toTheTop = await isaacRepo.CoordinatesAreTaken(1000, 970, 30, 30);                      // rectangle starts directly at the top
            var toTheBottom = await isaacRepo.CoordinatesAreTaken(1000, 1030, 30, 30);                  // rectangle starts directly at the bottom

            // ASSERT
            overlapsExact.Should().BeTrue();
            overlapsPartiallyMiddle.Should().BeTrue();
            overlapsLastPixel.Should().BeTrue();

            toTheRight.Should().BeFalse();
            toTheLeft.Should().BeFalse();
            toTheTop.Should().BeFalse();
            toTheBottom.Should().BeFalse();
        }

        [Theory(DisplayName = "UpdateIconCoordinates can update the css coordinates"), AutoDataMoq]
        public async Task T14(CreateIsaacResource item)
        {
            // ARRANGE - create item
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 0, 10, 20, 30);

            // ACT - change coordinates
            var itemBefore = await isaacRepo.GetResourceById(itemId, false, false);
            int updateChanges = await isaacRepo.UpdateIconCoordinates(itemId, 100, 110, 40, 50);
            var itemAfter = await isaacRepo.GetResourceById(itemId, false, false);

            // ASSERT - coordinates are updated
            itemBefore.X.Should().Be(0);
            itemBefore.Y.Should().Be(10);
            itemBefore.W.Should().Be(20);
            itemBefore.H.Should().Be(30);

            updateChanges.Should().Be(1);

            itemAfter.X.Should().Be(100);
            itemAfter.Y.Should().Be(110);
            itemAfter.W.Should().Be(40);
            itemAfter.H.Should().Be(50);
        }

        [Theory(DisplayName = "UpdateExistsIn can update exists_in"), AutoDataMoq]
        public async Task T15(CreateIsaacResource item)
        {
            // ARRANGE - create item
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 0, 10, 20, 30);

            // ACT - get item, change exists_in, get item again and compare
            var itemBefore = await isaacRepo.GetResourceById(itemId, false, false);
            var updateChanges = await isaacRepo.UpdateExistsIn(itemId, ExistsIn.VanillaOnly);
            var itemAfter = await isaacRepo.GetResourceById(itemId, false, false);

            // ASSERT make sure exists_in changed
            itemBefore.ExistsIn.Should().Be(item.ExistsIn);
            updateChanges.Should().Be(1);
            itemAfter.ExistsIn.Should().Be(ExistsIn.VanillaOnly);
        }

        [Theory(DisplayName = "UpdateGameMode can update game_mode"), AutoDataMoq]
        public async Task T16(CreateIsaacResource item)
        {
            // ARRANGE - create item
            var isaacRepo = _fixture.TestServer.Host.Services.GetService(typeof(IIsaacRepository)) as IIsaacRepository;

            item.FromMod = null;
            var itemId = await isaacRepo.SaveResource(item, 0, 10, 20, 30);

            // ACT - get item, change game_mode, get item again and compare
            var itemBefore = await isaacRepo.GetResourceById(itemId, false, false);
            var updateChanges = await isaacRepo.UpdateGameMode(itemId, GameMode.SpecialChallenge);
            var itemAfter = await isaacRepo.GetResourceById(itemId, false, false);

            // ASSERT make sure game_mode changed
            itemBefore.GameMode.Should().Be(item.GameMode);
            updateChanges.Should().Be(1);
            itemAfter.GameMode.Should().Be(GameMode.SpecialChallenge);
        }
    }
}
