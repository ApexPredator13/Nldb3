using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Website.Controllers;
using Website.Models.MyAccount;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Controllers
{
    public class MyAccountControllerTests
    {
        [Fact(DisplayName = "ChangePassword [GET] redirects to login page if user is not found")]
        public async Task T1()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder().Build();

            // act
            var result = await controller.ChangePassword() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "ChangePassword [GET] redirects to set password page if user has no password yet")]
        public async Task T2()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .WithAuthenticatedUser()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .Build();

            // act
            var result = await controller.ChangePassword() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.SetPassword));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
        }

        [Fact(DisplayName = "ChangePassword [GET] displays view if user can change password")]
        public async Task T3()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .WithAuthenticatedUser()
                .GetUserSucceeds()
                .UserHasPassword()
                .Build();

            // act
            var result = await controller.ChangePassword() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().NotBeNull().And.BeOfType<ChangePasswordModel>();

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
        }

        [Fact(DisplayName = "ChangePassword [POST] redisplays view if model is invalid")]
        public async Task T4()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder().Build();
            controller.ModelState.AddModelError("some", "error");

            var model = new ChangePasswordModel
            {
                ConfirmNewPassword = "c",
                CurrentPassword = "c",
                NewPassword = "n"
            };

            // act
            var result = await controller.ChangePassword(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Never);
        }

        [Fact(DisplayName = "ChangePassword [POST] redirects to login page if user is not found")]
        public async Task T5()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.ChangePassword(new ChangePasswordModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "ChangePassword [POST] redirects to set password page if user has no password yet")]
        public async Task T6()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .Build();

            // act
            var result = await controller.ChangePassword(new ChangePasswordModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.SetPassword));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.ChangePasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ChangePassword [POST] redisplays view if password change failed")]
        public async Task T7()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasPassword()
                .ChangePasswordFails()
                .Build();

            var model = new ChangePasswordModel
            {
                ConfirmNewPassword = "c",
                CurrentPassword = "c",
                NewPassword = "n"
            };

            // act
            var result = await controller.ChangePassword(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.ChangePasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.RefreshSignInAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "ChangePassword [POST] redirects back to profile if password was changed successfully")]
        public async Task T8()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasPassword()
                .ChangePasswordSucceeds()
                .Build();

            // act
            var result = await controller.ChangePassword(new ChangePasswordModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.Index));
            result.RouteValues.Should().ContainKey("message").WhichValue.Should().Be(MyAccountMessage.YourPasswordWasChanged);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.ChangePasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.RefreshSignInAsync(It.IsAny<IdentityUser>()), Times.Once);
        }
    }
}
