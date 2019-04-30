using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Areas.Admin.Controllers;
using Website.Areas.Admin.ViewModels;
using Website.Models.Database;
using Website.Models.Database.Enums;
using Website.Services;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Controllers
{
    public class IsaacControllerTests
    {
        [Fact(DisplayName = "ChangeName [GET] redirects to index page with error message if resource was not found")]
        public async Task T1()
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync((IsaacResource)null);
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeName("x") as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().NotBeNull();
        }

        [Fact(DisplayName = "ChangeName [GET] shows view if resource is found")]
        public async Task T2()
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(new IsaacResource());
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeName("x") as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().NotBeNull().And.BeOfType<ChangeName>();
        }

        [Theory(DisplayName = "ChangeName [POST] redisplays view if model is invalid"), AutoData]
        public async Task T3(ChangeName viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.ChangeName(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(viewModel);

            repo.Verify(x => x.UpdateName(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Theory(DisplayName = "ChangeName [POST] redirects to index page with error message if update failed"), AutoData]
        public async Task T4(ChangeName viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateName(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(0);
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeName(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().NotBeNull();

            repo.Verify(x => x.UpdateName(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Theory(DisplayName = "ChangeName [POST] redirects back to details page after update"), AutoData]
        public async Task T5(ChangeName viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateName(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(1);
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeName(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Details));

            repo.Verify(x => x.UpdateName(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "ChangeId [GET] redirects to index page with error message if resource was not found")]
        public async Task T6()
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync((IsaacResource)null);
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeId("x") as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().NotBeNull();
        }

        [Fact(DisplayName = "ChangeId [GET] shows view if resource is found")]
        public async Task T7()
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(new IsaacResource());
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();
            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeId("x") as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().NotBeNull().And.BeOfType<ChangeId>();
        }

        [Theory(DisplayName = "ChangeId [POST] redisplays view if model is invalid"), AutoData]
        public async Task T8(ChangeId viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.ChangeId(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(viewModel);

            repo.Verify(x => x.UpdateId(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Theory(DisplayName = "ChangeId [POST] redirects to index page with error message if update failed"), AutoData]
        public async Task T9(ChangeId viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateId(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(0);
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeId(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().NotBeNull();

            repo.Verify(x => x.UpdateId(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Theory(DisplayName = "ChangeId [POST] redirects back to details page after update"), AutoData]
        public async Task T10(ChangeId viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateId(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(1);
            var iconManager = new Mock<IIsaacIconManager>();
            var modRepository = new Mock<IModRepository>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeId(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Details));

            repo.Verify(x => x.UpdateId(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "Create [GET] returns view with mod list in ViewData")]
        public async Task T11()
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            var modRepository = new Mock<IModRepository>();
            modRepository.Setup(x => x.GetAllMods()).ReturnsAsync(new List<Mod>());
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.Create() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewData["Mods"].Should().NotBeNull().And.BeOfType<List<Mod>>();
            result.ViewName.Should().BeNull();

            modRepository.Verify(x => x.GetAllMods(), Times.Once);
        }

        [Theory(DisplayName = "Create [POST] redisplays view if modelstate is invalid"), AutoDataMoq]
        public async Task T12(CreateIsaacResource viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            var modRepository = new Mock<IModRepository>();
            modRepository.Setup(x => x.GetAllMods()).ReturnsAsync(new List<Mod>());
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.Create(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.Model.Should().BeEquivalentTo(viewModel);
            result.ViewName.Should().BeNull();

            modRepository.Verify(x => x.GetAllMods(), Times.Once);
            iconManager.Verify(x => x.GetPostedImageSize(It.IsAny<IFormFile>()), Times.Never);
            iconManager.Verify(x => x.FindEmptySquare(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
            iconManager.Verify(x => x.EmbedIcon(It.IsAny<IFormFile>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        [Theory(DisplayName = "Create [POST] redirects to details page after creating"), AutoDataMoq]
        public async Task T13(CreateIsaacResource viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.SaveResource(It.IsAny<CreateIsaacResource>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync("a");
            var modRepository = new Mock<IModRepository>();
            modRepository.Setup(x => x.GetAllMods()).ReturnsAsync(new List<Mod>());
            var iconManager = new Mock<IIsaacIconManager>();
            iconManager.Setup(x => x.GetPostedImageSize(It.IsAny<IFormFile>())).ReturnsAsync((1, 1));
            iconManager.Setup(x => x.FindEmptySquare(It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync((1, 1));
            iconManager.Setup(x => x.EmbedIcon(It.IsAny<IFormFile>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).Verifiable();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.Create(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Details));

            modRepository.Verify(x => x.GetAllMods(), Times.Never);
            iconManager.Verify(x => x.GetPostedImageSize(It.IsAny<IFormFile>()), Times.Once);
            iconManager.Verify(x => x.FindEmptySquare(It.IsAny<int>(), It.IsAny<int>()), Times.Once);
            iconManager.Verify(x => x.EmbedIcon(It.IsAny<IFormFile>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Once);
            repo.Verify(x => x.SaveResource(It.IsAny<CreateIsaacResource>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Once);
        }

        [Theory(DisplayName = "ChangeIcon [POST] redisplays view if modelstate is invalid"), AutoDataMoq]
        public async Task T14(ChangeIcon viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.ChangeIcon(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.Model.Should().BeEquivalentTo(viewModel);
            result.ViewName.Should().BeNull();

            iconManager.Verify(x => x.GetPostedImageSize(It.IsAny<IFormFile>()), Times.Never);
            iconManager.Verify(x => x.FindEmptySquare(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
            iconManager.Verify(x => x.EmbedIcon(It.IsAny<IFormFile>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }


        [Theory(DisplayName = "ChangeIcon [POST] redirects to index page with error message if resource is not found"), AutoDataMoq]
        public async Task T15(ChangeIcon viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync((IsaacResource)null);
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();
            
            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeIcon(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().NotBeNull();

            repo.Verify(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
            iconManager.Verify(x => x.GetPostedImageSize(It.IsAny<IFormFile>()), Times.Never);
            iconManager.Verify(x => x.FindEmptySquare(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
            iconManager.Verify(x => x.EmbedIcon(It.IsAny<IFormFile>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        [Theory(DisplayName = "ChangeIcon [POST] redirects back to details page after updating"), AutoDataMoq]
        public async Task T16(ChangeIcon viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(new IsaacResource());
            repo.Setup(x => x.UpdateIconCoordinates(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(1);
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();
            iconManager.Setup(x => x.GetPostedImageSize(It.IsAny<IFormFile>())).ReturnsAsync((1, 1));
            iconManager.Setup(x => x.FindEmptySquare(It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync((1, 1));
            iconManager.Setup(x => x.EmbedIcon(It.IsAny<IFormFile>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>())).Verifiable();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeIcon(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Details));

            repo.Verify(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
            repo.Verify(x => x.UpdateIconCoordinates(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Once);
            iconManager.Verify(x => x.GetPostedImageSize(It.IsAny<IFormFile>()), Times.Once);
            iconManager.Verify(x => x.FindEmptySquare(It.IsAny<int>(), It.IsAny<int>()), Times.Once);
            iconManager.Verify(x => x.EmbedIcon(It.IsAny<IFormFile>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Once);
        }

        [Theory(DisplayName = "ChangeExistsIn [POST] redisplays view if modelstate is invalid"), AutoData]
        public async Task T17(ChangeExistsIn viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.ChangeExistsIn(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.Model.Should().BeEquivalentTo(viewModel);
            result.ViewName.Should().BeNull();

            repo.Verify(x => x.UpdateExistsIn(It.IsAny<string>(), It.IsAny<ExistsIn>()), Times.Never);
        }

        [Theory(DisplayName = "ChangeExistsIn [POST] redirects to index page with error message if update failed"), AutoData]
        public async Task T18(ChangeExistsIn viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateExistsIn(It.IsAny<string>(), It.IsAny<ExistsIn>())).ReturnsAsync(0);
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeExistsIn(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().NotBeNull();

            repo.Verify(x => x.UpdateExistsIn(It.IsAny<string>(), It.IsAny<ExistsIn>()), Times.Once);
        }

        [Theory(DisplayName = "ChangeExistsIn [POST] redirects to details page after updating"), AutoData]
        public async Task T19(ChangeExistsIn viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateExistsIn(It.IsAny<string>(), It.IsAny<ExistsIn>())).ReturnsAsync(1);
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeExistsIn(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Details));

            repo.Verify(x => x.UpdateExistsIn(It.IsAny<string>(), It.IsAny<ExistsIn>()), Times.Once);
        }

        [Theory(DisplayName = "ChangeGameMode [POST] redisplays view if modelstate is invalid"), AutoData]
        public async Task T20(ChangeGameMode viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.ChangeGameMode(viewModel) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.Model.Should().BeEquivalentTo(viewModel);
            result.ViewName.Should().BeNull();

            repo.Verify(x => x.UpdateGameMode(It.IsAny<string>(), It.IsAny<GameMode>()), Times.Never);
        }

        [Theory(DisplayName = "ChangeGameMode [POST] redirects to index page with error message if update failed"), AutoData]
        public async Task T21(ChangeGameMode viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateGameMode(It.IsAny<string>(), It.IsAny<GameMode>())).ReturnsAsync(0);
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeGameMode(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().NotBeNull();

            repo.Verify(x => x.UpdateGameMode(It.IsAny<string>(), It.IsAny<GameMode>()), Times.Once);
        }

        [Theory(DisplayName = "ChangeGameMode [POST] redirects to details page after updating"), AutoData]
        public async Task T22(ChangeGameMode viewModel)
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.UpdateGameMode(It.IsAny<string>(), It.IsAny<GameMode>())).ReturnsAsync(1);
            var modRepository = new Mock<IModRepository>();
            var iconManager = new Mock<IIsaacIconManager>();

            var controller = new IsaacController(repo.Object, iconManager.Object, modRepository.Object);

            // act
            var result = await controller.ChangeGameMode(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Details));

            repo.Verify(x => x.UpdateGameMode(It.IsAny<string>(), It.IsAny<GameMode>()), Times.Once);
        }
    }
}
