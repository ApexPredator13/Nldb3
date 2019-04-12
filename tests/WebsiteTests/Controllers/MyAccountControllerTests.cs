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

        [Fact(DisplayName = "DeleteAccount [GET] redirects to login page if user is not found")]
        public async Task T9()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.DeleteAccount() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "DeleteAccount [GET] displays view with model set to FALSE if user has no password set")]
        public async Task T10()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .Build();

            // act
            var result = await controller.DeleteAccount() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeOfType<bool>().And.Be(false);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
        }

        [Fact(DisplayName = "DeleteAccount [GET] displays view with model set to TRUE if user has password set")]
        public async Task T11()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasPassword()
                .Build();

            // act
            var result = await controller.DeleteAccount() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeOfType<bool>().And.Be(true);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redirects to login page if user was not found")]
        public async Task T12()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.DeleteAccount(new DeleteAccountInputModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redisplays view if user has password but has not entered one")]
        public async Task T13()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasPassword()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = string.Empty,
                UserNameOrEmail = "x"
            };

            // act
            var result = await controller.DeleteAccount(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redisplays view if user has no password and has not entered email or username")]
        public async Task T14()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = "x",
                UserNameOrEmail = string.Empty
            };

            // act
            var result = await controller.DeleteAccount(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redisplays view if user has password and entered wrong password")]
        public async Task T15()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasPassword()
                .CheckPasswordFails()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = "x",
                UserNameOrEmail = string.Empty
            };

            // act
            var result = await controller.DeleteAccount(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.CheckPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redisplays view if user has no password and entered wrong username")]
        public async Task T16()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds("x", null)
                .UserHasNoPassword()
                .CheckPasswordFails()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = string.Empty,
                UserNameOrEmail = "y"
            };

            // act
            var result = await controller.DeleteAccount(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redisplays view if user has no password and entered wrong email")]
        public async Task T17()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds(null, "x")
                .UserHasNoPassword()
                .CheckPasswordFails()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = string.Empty,
                UserNameOrEmail = "y"
            };

            // act
            var result = await controller.DeleteAccount(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redirects to success page if user with password deleted his account")]
        public async Task T18()
        {
            // arrange
            var claims = new Dictionary<string, string>() { { ClaimTypes.Name, "x" } };

            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .WithAuthenticatedUser(claims)
                .GetUserSucceeds()
                .UserHasPassword()
                .CheckPasswordSucceeds()
                .DeleteUserProfileSucceeds()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = "x",
                UserNameOrEmail = string.Empty
            };

            // act
            var result = await controller.DeleteAccount(model) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.AccountWasDeleted));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Once);
            signInManager.Verify(x => x.SignOutAsync(), Times.Once);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redirects to success page if user without password deleted his account")]
        public async Task T19()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds("x", null)
                .UserHasNoPassword()
                .DeleteUserProfileSucceeds()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = string.Empty,
                UserNameOrEmail = "x"
            };

            // act
            var result = await controller.DeleteAccount(model) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.AccountWasDeleted));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Once);
            signInManager.Verify(x => x.SignOutAsync(), Times.Once);
        }

        [Fact(DisplayName = "DeleteAccount [POST] redisplays view if profile cannot be deleted")]
        public async Task T20()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds("x", null)
                .UserHasNoPassword()
                .DeleteUserProfileFails()
                .Build();

            var model = new DeleteAccountInputModel
            {
                Password = string.Empty,
                UserNameOrEmail = "x"
            };

            // act
            var result = await controller.DeleteAccount(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Once);
            signInManager.Verify(x => x.SignOutAsync(), Times.Never);
        }
    }
}
