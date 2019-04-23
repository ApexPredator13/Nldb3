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

        [Theory(DisplayName = "SaveBoss can create and read a boss"), AutoData]
        public async Task T1(SaveBossModel model)
        {
            // arrange
            var repo = _fixture.TestServer.Host.Services.GetService(typeof(IBossRepository)) as IBossRepository;
            model.FromMod = null;

            // act
            await repo.SaveBoss(model);

            // assert
            var boss = await repo.GetBossById(model.Id, false, false);
            boss.Id.Should().Be(model.Id);
            boss.BossTags.Should().BeEmpty();
            boss.Color.Should().Be(model.Color);
            boss.DoubleTrouble.Should().Be(model.DoubleTrouble);
            boss.ExistsIn.Should().Be(model.ExistsIn);
            boss.GameMode.Should().Be(model.GameMode);
            boss.Mod.Should().BeNull();
            boss.W.Should().Be(model.W);
            boss.X.Should().Be(model.X);
            boss.Y.Should().Be(model.Y);
        }
    }
}
