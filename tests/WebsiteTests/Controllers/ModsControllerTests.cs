using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.Controllers;
using Website.Areas.Admin.ViewModels;
using Website.Models.Database;
using Website.Services;
using Xunit;

namespace WebsiteTests.Controllers
{
    public class ModsControllerTests
    {
        [Theory(DisplayName = "CreateMod [POST] redisplays view if model is invalid"), AutoData]
        public async Task T1(CreateMod viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            var controller = new ModsController(repo.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.CreateMod(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(viewModel);

            repo.Verify(x => x.SaveMod(It.IsAny<CreateMod>()), Times.Never);
        }

        [Theory(DisplayName = "CreateMod [POST] redirects to mod page after it was created"), AutoData]
        public async Task T2(CreateMod viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            repo.Setup(x => x.SaveMod(It.IsAny<CreateMod>())).ReturnsAsync(1);
            var controller = new ModsController(repo.Object);

            // act
            var result = await controller.CreateMod(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(ModsController.Mod));
            result.RouteValues.Should().ContainKey("modId").WhichValue.Should().Be(1);

            repo.Verify(x => x.SaveMod(It.IsAny<CreateMod>()), Times.Once);
        }

        [Theory(DisplayName = "CreateLink [POST] redisplays view if model is invalid"), AutoData]
        public async Task T3(CreateModLink viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            var controller = new ModsController(repo.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.CreateLink(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(viewModel);

            repo.Verify(x => x.AddModUrl(It.IsAny<CreateModLink>()), Times.Never);
        }

        [Theory(DisplayName = "CreateLink [POST] redirects to mod page after creating the link"), AutoData]
        public async Task T4(CreateModLink viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            var controller = new ModsController(repo.Object);

            // act
            var result = await controller.CreateLink(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(ModsController.Mod));
            result.RouteValues.Should().ContainKey("modId").WhichValue.Should().Be(viewModel.ModId);

            repo.Verify(x => x.AddModUrl(It.IsAny<CreateModLink>()), Times.Once);
        }

        [Theory(DisplayName = "DeleteLink [POST] redisplays view if model is invalid"), AutoData]
        public async Task T5(DeleteModLink viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            var controller = new ModsController(repo.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.DeleteLink(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(viewModel);

            repo.Verify(x => x.RemoveModUrl(It.IsAny<int>()), Times.Never);
        }

        [Theory(DisplayName = "DeleteLink [POST] redirects back to mod page after deleting"), AutoData]
        public async Task T6(DeleteModLink viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            repo.Setup(x => x.RemoveModUrl(It.IsAny<int>())).ReturnsAsync(1);
            var controller = new ModsController(repo.Object);

            // act
            var result = await controller.DeleteLink(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(ModsController.Mod));
            result.RouteValues.Should().ContainKey("modId").WhichValue.Should().Be(viewModel.ModId);

            repo.Verify(x => x.RemoveModUrl(It.IsAny<int>()), Times.Once);
        }

        [Theory(DisplayName = "DeleteMod [POST] redisplays view if model is invalid"), AutoData]
        public async Task T7(DeleteMod viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            repo.Setup(x => x.GetAllMods()).ReturnsAsync(new List<Mod>());
            var controller = new ModsController(repo.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.DeleteMod(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.Model.Should().BeOfType<List<Mod>>();
            result.ViewName.Should().Be(nameof(ModsController.Index));
        }

        [Theory(DisplayName = "DeleteMod [POST] redirects back to mod index page after deleting"), AutoData]
        public async Task T8(DeleteMod viewModel)
        {
            // arrange
            var repo = new Mock<IModRepository>();
            repo.Setup(x => x.RemoveModUrl(It.IsAny<int>())).ReturnsAsync(1);
            var controller = new ModsController(repo.Object);

            // act
            var result = await controller.DeleteMod(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(ModsController.Index));

            repo.Verify(x => x.RemoveMod(It.IsAny<int>()), Times.Once);
        }
    }
}
