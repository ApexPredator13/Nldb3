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
    public class IsaacControllerTests
    {
        [Fact(DisplayName = "ChangeName [GET] redirects to index page with error message if resource was not found")]
        public async Task T1()
        {
            // arrange
            var repo = new Mock<IIsaacRepository>();
            repo.Setup(x => x.GetResourceById(It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync((IsaacResource)null);
            var controller = new IsaacController(repo.Object);

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
            var controller = new IsaacController(repo.Object);

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
            var controller = new IsaacController(repo.Object);
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
            var controller = new IsaacController(repo.Object);

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
            var controller = new IsaacController(repo.Object);

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
            var controller = new IsaacController(repo.Object);

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
            var controller = new IsaacController(repo.Object);

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
            var controller = new IsaacController(repo.Object);
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
            var controller = new IsaacController(repo.Object);

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
            var controller = new IsaacController(repo.Object);

            // act
            var result = await controller.ChangeId(viewModel) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(IsaacController.Details));

            repo.Verify(x => x.UpdateId(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }
    }
}
