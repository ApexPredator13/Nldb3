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
    public class ModRepositoryTests
    {
        private readonly IntegrationtestFixture _fixture;

        public ModRepositoryTests(IntegrationtestFixture fixture)
        {
            _fixture = fixture;
        }

        [Theory(DisplayName = "SaveMod can create and read a mod"), AutoData]
        public async Task T1(SaveMod model)
        {
            // arrange
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;

            // act
            await repo.SaveMod(model);
            var mod = await repo.GetModByName(model.ModName);

            // assert
            mod.ModName.Should().Be(model.ModName);
        }

        [Theory(DisplayName = "AddModUrl can add mod urls to a mod"), AutoData]
        public async Task T2(SaveMod mod, AddModUrl modUrl1, AddModUrl modUrl2)
        {
            // arrange
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            await repo.SaveMod(mod);
            var savedMod = await repo.GetModByName(mod.ModName);
            modUrl1.ModId = savedMod.Id;
            modUrl2.ModId = savedMod.Id;

            // act
            await repo.AddModUrl(modUrl1);
            await repo.AddModUrl(modUrl2);
            var modWithUrls = await repo.GetModByName(mod.ModName);

            // assert
            modWithUrls.ModName.Should().Be(mod.ModName);
            modWithUrls.ModUrls.Should().NotBeNullOrEmpty().And.HaveCount(2);
            modWithUrls.ModUrls[0].LinkText.Should().Be(modUrl1.LinkText);
            modWithUrls.ModUrls[0].Url.Should().Be(modUrl1.Url);
            modWithUrls.ModUrls[1].LinkText.Should().Be(modUrl2.LinkText);
            modWithUrls.ModUrls[1].Url.Should().Be(modUrl2.Url);
        }

        [Theory(DisplayName = "RemoveModUrl can remove a mod url"), AutoData]
        public async Task T3(SaveMod mod, AddModUrl modUrl1, AddModUrl modUrl2)
        {
            // arrange
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IModRepository)) as IModRepository;
            await repo.SaveMod(mod);
            var savedMod = await repo.GetModByName(mod.ModName);
            modUrl1.ModId = savedMod.Id;
            modUrl2.ModId = savedMod.Id;
            await repo.AddModUrl(modUrl1);
            await repo.AddModUrl(modUrl2);
            var modWithUrls = await repo.GetModByName(mod.ModName);

            // act
            await repo.RemoveModUrl(modWithUrls.ModUrls[0].Id);
            var modWithOneUrlRemaining = await repo.GetModByName(mod.ModName);
            
            // assert
            modWithOneUrlRemaining.ModName.Should().Be(mod.ModName);
            modWithOneUrlRemaining.ModUrls.Should().NotBeNullOrEmpty().And.HaveCount(1);
            modWithOneUrlRemaining.ModUrls[0].LinkText.Should().Be(modUrl2.LinkText);
            modWithOneUrlRemaining.ModUrls[0].Url.Should().Be(modUrl2.Url);
        }
    }
}
