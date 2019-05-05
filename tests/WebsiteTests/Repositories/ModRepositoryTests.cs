using AutoFixture.Xunit2;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.ViewModels;
using Website.Services;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Repositories
{
    [Collection("database_tests")]
    public class ModRepositoryTests
    {
        private readonly DatabaseTestFixture _fixture;

        public ModRepositoryTests(DatabaseTestFixture fixture)
        {
            _fixture = fixture;
        }

        [Theory(DisplayName = "SaveMod can create and read a mod"), AutoData]
        public async Task T1(CreateMod model)
        {
            // ARRANGE
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            // ACT
            var modId = await repo.SaveMod(model);
            var modByName = await repo.GetModByName(model.ModName);
            var modById = await repo.GetModById(modId);

            // ASSERT
            modByName.ModName.Should().Be(model.ModName);
            modByName.Id.Should().Be(modId);
            modById.ModName.Should().Be(model.ModName);
            modById.Id.Should().Be(modId);
        }

        [Theory(DisplayName = "AddModUrl can add mod urls to a mod"), AutoData]
        public async Task T2(CreateMod mod, CreateModLink modUrl1, CreateModLink modUrl2)
        {
            // ARRANGE - create a mod
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            var modId = await repo.SaveMod(mod);
            modUrl1.ModId = modId;
            modUrl2.ModId = modId;

            // ACT - add two urls
            await repo.AddModUrl(modUrl1);
            await repo.AddModUrl(modUrl2);
            var modWithUrls = await repo.GetModByName(mod.ModName);

            // ASSERT - urls are saved correctly
            modWithUrls.ModName.Should().Be(mod.ModName);
            modWithUrls.ModUrls.Should().NotBeNullOrEmpty().And.HaveCount(2);
            modWithUrls.ModUrls[0].LinkText.Should().Be(modUrl1.LinkText);
            modWithUrls.ModUrls[0].Url.Should().Be(modUrl1.Url);
            modWithUrls.ModUrls[1].LinkText.Should().Be(modUrl2.LinkText);
            modWithUrls.ModUrls[1].Url.Should().Be(modUrl2.Url);
        }

        [Theory(DisplayName = "RemoveModUrl can remove a mod url"), AutoData]
        public async Task T3(CreateMod mod, CreateModLink modUrl1, CreateModLink modUrl2)
        {
            // ARRANGE - create mod, include 2 urls
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            var modId = await repo.SaveMod(mod);
            modUrl1.ModId = modId;
            modUrl2.ModId = modId;
            await repo.AddModUrl(modUrl1);
            await repo.AddModUrl(modUrl2);
            var modWithUrls = await repo.GetModByName(mod.ModName);

            // ACT - remove the first url
            await repo.RemoveModUrl(modWithUrls.ModUrls[0].Id);
            var modWithOneUrlRemaining = await repo.GetModByName(mod.ModName);
            
            // ASSERT - only the second url remains
            modWithOneUrlRemaining.ModName.Should().Be(mod.ModName);
            modWithOneUrlRemaining.ModUrls.Should().NotBeNullOrEmpty().And.HaveCount(1);
            modWithOneUrlRemaining.ModUrls[0].LinkText.Should().Be(modUrl2.LinkText);
            modWithOneUrlRemaining.ModUrls[0].Url.Should().Be(modUrl2.Url);
        }

        [Theory(DisplayName = "RemoveMod can remove a mod (including its urls)"), AutoData]
        public async Task T4(CreateMod mod, CreateModLink modUrl)
        {
            // ARRANGE - create mod, include a url
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            var modId = await repo.SaveMod(mod);
            modUrl.ModId = modId;
            await repo.AddModUrl(modUrl);
            var modWithUrl = await repo.GetModByName(mod.ModName);

            // ACT - remove the mod
            await repo.RemoveMod(modWithUrl.Id);
            var deletedMod = await repo.GetModById(modWithUrl.Id);
            var deletedUrl = await repo.GetModUrlById(modWithUrl.ModUrls[0].Id);

            // ASSERT - both mod and url are gone
            deletedMod.Should().BeNull();
            deletedUrl.Should().BeNull();
        }

        [Theory(DisplayName = "GetModUrlById can return a mod url"), AutoData]
        public async Task T5(CreateMod mod, CreateModLink modUrl)
        {
            // ARRANGE - create mod, include a url
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            var modId = await repo.SaveMod(mod);
            modUrl.ModId = modId;
            await repo.AddModUrl(modUrl);
            var modWithUrl = await repo.GetModByName(mod.ModName);

            // ACT - get the url
            var url = await repo.GetModUrlById(modWithUrl.ModUrls[0].Id);

            // ASSERT - url is ok
            url.Id.Should().Be(modWithUrl.ModUrls[0].Id);
            url.LinkText.Should().Be(modUrl.LinkText);
            url.Url.Should().Be(modUrl.Url);
        }
    }
}
