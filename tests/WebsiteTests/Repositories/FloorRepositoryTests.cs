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
    public class FloorRepositoryTests
    {
        private readonly IntegrationtestFixture _fixture;

        public FloorRepositoryTests(IntegrationtestFixture fixture)
        {
            _fixture = fixture;
        }

        [Theory(DisplayName = "SaveFloor can create and read a floor by id and name (with or without mod)"), AutoData]
        public async Task T1(SaveMod mod, SaveFloor model, AddModUrl url)
        {
            // ARRANGE - create mod
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            var floorRepo = _fixture.TestServer.Host.Services.GetService(typeof(IFloorRepository)) as IFloorRepository;

            var modId = await modRepo.SaveMod(mod);
            model.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            // ACT - create floor, then read floor back twice (with mod and without)
            var savedFloorId = await floorRepo.SaveFloor(model);
            var savedFloorWithModById = await floorRepo.GetFloorById(savedFloorId, true);
            var savedFloorWithoutModById = await floorRepo.GetFloorById(savedFloorId, false);
            var savedFloorWithModByName = await floorRepo.GetFloorByName(model.Name, true);
            var savedFloorWithoutModByName = await floorRepo.GetFloorByName(model.Name, false);

            // ASSERT
            savedFloorId.Should().NotBeNullOrEmpty();

            savedFloorWithModById.Color.Should().Be(model.Color);
            savedFloorWithModById.ExistsIn.Should().Be(model.ExistsIn);
            savedFloorWithModById.GameMode.Should().Be(model.GameMode);
            savedFloorWithModById.Id.Should().Be(savedFloorId);
            savedFloorWithModById.Mod.Should().BeEquivalentTo(savedMod);
            savedFloorWithModById.Mod.ModUrls.Should().NotBeNullOrEmpty().And.HaveCount(1);
            savedFloorWithModById.Name.Should().Be(model.Name);
            savedFloorWithModById.W.Should().Be(model.W);
            savedFloorWithModById.X.Should().Be(model.X);
            savedFloorWithModById.Y.Should().Be(model.Y);
            savedFloorWithModById.DisplayOrder.Should().Be(model.DisplayOrder);
            savedFloorWithModById.Difficulty.Should().Be(model.Difficulty);

            savedFloorWithoutModById.Color.Should().Be(model.Color);
            savedFloorWithoutModById.ExistsIn.Should().Be(model.ExistsIn);
            savedFloorWithoutModById.GameMode.Should().Be(model.GameMode);
            savedFloorWithoutModById.Id.Should().Be(savedFloorId);
            savedFloorWithoutModById.Mod.Should().BeNull();
            savedFloorWithoutModById.Name.Should().Be(model.Name);
            savedFloorWithoutModById.W.Should().Be(model.W);
            savedFloorWithoutModById.X.Should().Be(model.X);
            savedFloorWithoutModById.Y.Should().Be(model.Y);
            savedFloorWithoutModById.DisplayOrder.Should().Be(model.DisplayOrder);
            savedFloorWithoutModById.Difficulty.Should().Be(model.Difficulty);

            savedFloorWithModByName.Color.Should().Be(model.Color);
            savedFloorWithModByName.ExistsIn.Should().Be(model.ExistsIn);
            savedFloorWithModByName.GameMode.Should().Be(model.GameMode);
            savedFloorWithModByName.Id.Should().Be(savedFloorId);
            savedFloorWithModByName.Mod.Should().BeEquivalentTo(savedMod);
            savedFloorWithModByName.Mod.ModUrls.Should().NotBeNullOrEmpty().And.HaveCount(1);
            savedFloorWithModByName.Name.Should().Be(model.Name);
            savedFloorWithModByName.W.Should().Be(model.W);
            savedFloorWithModByName.X.Should().Be(model.X);
            savedFloorWithModByName.Y.Should().Be(model.Y);
            savedFloorWithModByName.DisplayOrder.Should().Be(model.DisplayOrder);
            savedFloorWithModByName.Difficulty.Should().Be(model.Difficulty);

            savedFloorWithoutModByName.Color.Should().Be(model.Color);
            savedFloorWithoutModByName.ExistsIn.Should().Be(model.ExistsIn);
            savedFloorWithoutModByName.GameMode.Should().Be(model.GameMode);
            savedFloorWithoutModByName.Id.Should().Be(savedFloorId);
            savedFloorWithoutModByName.Mod.Should().BeNull();
            savedFloorWithoutModByName.Name.Should().Be(model.Name);
            savedFloorWithoutModByName.W.Should().Be(model.W);
            savedFloorWithoutModByName.X.Should().Be(model.X);
            savedFloorWithoutModByName.Y.Should().Be(model.Y);
            savedFloorWithoutModByName.DisplayOrder.Should().Be(model.DisplayOrder);
            savedFloorWithoutModByName.Difficulty.Should().Be(model.Difficulty);
        }

        [Theory(DisplayName = "GetAllFloors can get a list of floors (with or without mods)"), AutoData]
        public async Task T2(SaveFloor model, SaveMod mod, AddModUrl url)
        {
            // ARRANGE - create mod and floor
            var modRepo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            var floorRepo = _fixture.TestServer.Host.Services.GetService(typeof(IFloorRepository)) as IFloorRepository;

            var modId = await modRepo.SaveMod(mod);
            model.FromMod = modId;
            url.ModId = modId;
            var _ = await modRepo.AddModUrl(url);
            var savedMod = await modRepo.GetModById(modId);

            var savedFloorId = await floorRepo.SaveFloor(model);

            // ACT - read back all floors
            var floorsWithoutMods = await floorRepo.GetAllFloors(false);
            var floorsWithMods = await floorRepo.GetAllFloors(true);

            // ASSERT - the previously saved floor exists in both results and is correct
            floorsWithMods.Count.Should().BeGreaterOrEqualTo(1);
            floorsWithMods.Should().Contain(x => x.Id == savedFloorId);

            var floorWithMod = floorsWithMods.First(x => x.Id == savedFloorId);
            floorWithMod.Color.Should().Be(model.Color);
            floorWithMod.ExistsIn.Should().Be(model.ExistsIn);
            floorWithMod.GameMode.Should().Be(model.GameMode);
            floorWithMod.Id.Should().Be(savedFloorId);
            floorWithMod.Mod.Should().BeEquivalentTo(savedMod);
            floorWithMod.Mod.ModUrls.Should().NotBeNullOrEmpty().And.HaveCount(1);
            floorWithMod.Name.Should().Be(model.Name);
            floorWithMod.W.Should().Be(model.W);
            floorWithMod.X.Should().Be(model.X);
            floorWithMod.Y.Should().Be(model.Y);
            floorWithMod.DisplayOrder.Should().Be(model.DisplayOrder);
            floorWithMod.Difficulty.Should().Be(model.Difficulty);

            var floorWithoutMod = floorsWithoutMods.First(x => x.Id == savedFloorId);
            floorWithoutMod.Color.Should().Be(model.Color);
            floorWithoutMod.ExistsIn.Should().Be(model.ExistsIn);
            floorWithoutMod.GameMode.Should().Be(model.GameMode);
            floorWithoutMod.Id.Should().Be(savedFloorId);
            floorWithoutMod.Mod.Should().BeNull();
            floorWithoutMod.Name.Should().Be(model.Name);
            floorWithoutMod.W.Should().Be(model.W);
            floorWithoutMod.X.Should().Be(model.X);
            floorWithoutMod.Y.Should().Be(model.Y);
            floorWithoutMod.DisplayOrder.Should().Be(model.DisplayOrder);
            floorWithoutMod.Difficulty.Should().Be(model.Difficulty);
        }

        [Theory(DisplayName = "DeleteFloor can delete a floor"), AutoData]
        public async Task T3(SaveFloor floor)
        {
            // ARRANGE - create floor
            floor.FromMod = null;
            var floorRepo = _fixture.TestServer.Host.Services.GetService(typeof(IFloorRepository)) as IFloorRepository;
            var savedFloorId = await floorRepo.SaveFloor(floor);

            // ACT - delete floor and try to read it back
            var deleteResult = await floorRepo.DeleteFloor(savedFloorId);
            var deletedFloor = await floorRepo.GetFloorById(savedFloorId, false);

            // ASSERT - floor is gone
            deleteResult.Should().Be(1);
            deletedFloor.Should().BeNull();
        }
    }
}
