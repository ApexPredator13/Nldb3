using FluentAssertions;
using Microsoft.AspNetCore.Authentication;
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

        [Fact(DisplayName = "ChangePassword [GET] redirects to add normal login page if user has no password yet")]
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
            result.ActionName.Should().Be(nameof(MyAccountController.AddNormalLogin));

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

        [Fact(DisplayName = "ChangePassword [POST] redirects to add normal login page if user has no password yet")]
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
            result.ActionName.Should().Be(nameof(MyAccountController.AddNormalLogin));

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

        [Fact(DisplayName = "DownloadMyData [POST] redirects to login page if user is not found")]
        public async Task T21()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.DownloadMyData() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
        }

        [Fact(DisplayName = "DownloadMyData [POST] returns TXT file if everything went OK")]
        public async Task T22()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .Build();

            // act
            var result = await controller.DownloadMyData() as FileContentResult;

            // assert
            result.Should().BeOfType<FileContentResult>();
            result.ContentType.Should().Be("text/plain");

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
        }

        [Fact(DisplayName = "ExternalLogins [GET] redirects to login page if user is not found")]
        public async Task T23()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.ExternalLogins() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.GetLoginsAsync(It.IsAny<IdentityUser>()), Times.Never);
            signInManager.Verify(x => x.GetExternalAuthenticationSchemesAsync(), Times.Never);
        }

        [Fact(DisplayName = "ExternalLogins [GET] shows view with logins")]
        public async Task T24()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .Build();

            // act
            var result = await controller.ExternalLogins() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.ViewData.Should().ContainKey("CurrentLogins").WhichValue.Should().BeOfType<List<UserLoginInfo>>();
            result.ViewData.Should().ContainKey("OtherLogins").WhichValue.Should().BeOfType<List<AuthenticationScheme>>();
            result.ViewData.Should().ContainKey("ShowRemoveButton").WhichValue.Should().Be(false);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.GetLoginsAsync(It.IsAny<IdentityUser>()), Times.Once);
            signInManager.Verify(x => x.GetExternalAuthenticationSchemesAsync(), Times.Once);
        }

        [Fact(DisplayName = "RemoveExternalLogin [POST] redirects to login page if user is not found")]
        public async Task T25()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.RemoveExternalLogin(new RemoveLoginModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.GetLoginsAsync(It.IsAny<IdentityUser>()), Times.Never);
            signInManager.Verify(x => x.GetExternalAuthenticationSchemesAsync(), Times.Never);
        }

        [Fact(DisplayName = "RemoveExternalLogin [POST] redisplays view if model is invalid")]
        public async Task T26()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .Build();

            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.RemoveExternalLogin(new RemoveLoginModel()) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().Be(nameof(MyAccountController.ExternalLogins));
            result.Model.Should().BeNull();

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.GetLoginsAsync(It.IsAny<IdentityUser>()), Times.Once);
            signInManager.Verify(x => x.GetExternalAuthenticationSchemesAsync(), Times.Once);
            userManager.Verify(x => x.RemoveLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "RemoveExternalLogin [POST] redisplays view if login could not be removed")]
        public async Task T27()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .RemoveLoginFails()
                .Build();

            // act
            var result = await controller.RemoveExternalLogin(new RemoveLoginModel()) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().Be(nameof(MyAccountController.ExternalLogins));
            result.Model.Should().BeNull();

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.RemoveLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.RefreshSignInAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "RemoveExternalLogin [POST] redirects back to external login page if login was removed")]
        public async Task T28()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .RemoveLoginSucceeds()
                .Build();

            // act
            var result = await controller.RemoveExternalLogin(new RemoveLoginModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.ExternalLogins));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.RemoveLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.RefreshSignInAsync(It.IsAny<IdentityUser>()), Times.Once);
        }

        [Fact(DisplayName = "LinkLoginCallback [GET] redirects to login page if user is not found")]
        public async Task T29()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.LinkLoginCallback();

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "LinkLoginCallback [GET] redirects to user profile with error message if login info is null")]
        public async Task T30()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .GetExternalLoginInfoAsyncFails()
                .Build();

            // act
            var result = await controller.LinkLoginCallback();

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.Index));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>()), Times.Never);
        }

        [Fact(DisplayName = "LinkLoginCallback [GET] redirects to user profile with error message if login cannot be added to profile")]
        public async Task T31()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .GetExternalLoginInfoAsyncSucceeds()
                .CannotAddLoginToUser()
                .Build();

            // act
            var result = await controller.LinkLoginCallback();

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.Index));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>()), Times.Once);
        }

        [Fact(DisplayName = "LinkLoginCallback [GET] redirects to ExternalLogins after login was added")]
        public async Task T32()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .GetExternalLoginInfoAsyncSucceeds()
                .CanAddLoginToUser()
                .Build();

            // act
            var result = await controller.LinkLoginCallback();

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.ExternalLogins));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>()), Times.Once);
        }

        [Fact(DisplayName = "AddNormalLogin [GET] redirects to login page if user is not found")]
        public async Task T33()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.AddNormalLogin() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "AddNormalLogin [GET] redirects to change password page if user has a password already")]
        public async Task T34()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasPassword()
                .Build();
            
            // act
            var result = await controller.AddNormalLogin() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.ChangePassword));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
        }

        [Fact(DisplayName = "AddNormalLogin [GET] shows view if user has no email/password login yet")]
        public async Task T35()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .Build();

            // act
            var result = await controller.AddNormalLogin() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
        }

        [Fact(DisplayName = "AddNormalLogin [POST] redisplays view if model is invalid")]
        public async Task T36()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder().Build();

            var model = new AddNormalLoginModel
            {
                ConfirmPassword = "c",
                Email = "e",
                Password = "p"
            };

            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.AddNormalLogin(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Never);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "AddNormalLogin [POST] redirects to login page if user is not found")]
        public async Task T37()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.AddNormalLogin(new AddNormalLoginModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "AddNormalLogin [POST] redirects to change password page if user has a password set already")]
        public async Task T38()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasPassword()
                .Build();

            // act
            var result = await controller.AddNormalLogin(new AddNormalLoginModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.ChangePassword));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.SetEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "AddNormalLogin [POST] redisplays view if email cannot be added to profile")]
        public async Task T39()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .SetEmailFails()
                .Build();

            var model = new AddNormalLoginModel
            {
                ConfirmPassword = "c",
                Email = "e",
                Password = "p"
            };

            // act
            var result = await controller.AddNormalLogin(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.SetEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.AddPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "AddNormalLogin [POST] redisplays view if password cannot be added to profile")]
        public async Task T40()
        {
            // arrange
            var (controller, userManager, _, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .SetEmailSucceeds()
                .AddPasswordFails()
                .Build();

            var model = new AddNormalLoginModel
            {
                ConfirmPassword = "c",
                Email = "e",
                Password = "p"
            };

            // act
            var result = await controller.AddNormalLogin(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.SetEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.AddPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "AddNormalLogin [POST] sends email and redirects to success page if everything was OK")]
        public async Task T41()
        {
            // arrange
            var (controller, userManager, emailService, signInManager) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .UserHasNoPassword()
                .SetEmailSucceeds()
                .AddPasswordSucceeds()
                .Build();

            // act
            var result = await controller.AddNormalLogin(new AddNormalLoginModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.NormalLoginAdded));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.HasPasswordAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.SetEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.AddPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<IdentityUser>()), Times.Once);
            emailService.Verify(x => x.GenerateConfirmEmailAddressEmail(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            emailService.Verify(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "ChangeEmail [GET] redirects to login page if user is not found")]
        public async Task T42()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.ChangeEmail() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
        }

        [Fact(DisplayName = "ChangeEmail [GET] redirects to 'add normal login' page if user has no email yet")]
        public async Task T43()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .Build();

            // act
            var result = await controller.ChangeEmail() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.AddNormalLogin));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
        }

        [Fact(DisplayName = "ChangeEmail [GET] shows view if user was found")]
        public async Task T44()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds(null, "some email")
                .Build();

            // act
            var result = await controller.ChangeEmail() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeOfType<ChangeEmailModel>();

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
        }

        [Fact(DisplayName = "ChangeEmail [POST] redisplays view if model is invalid")]
        public async Task T45()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder().Build();

            var model = new ChangeEmailModel
            {
                Email = "e"
            };

            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.ChangeEmail(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Never);
        }

        [Fact(DisplayName = "ChangeEmail [POST] redirects to login page if user is not found")]
        public async Task T46()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.ChangeEmail(new ChangeEmailModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.GenerateChangeEmailTokenAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ChangeEmail [POST] redirects to 'add normal login' page if user has no email yet")]
        public async Task T47()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .Build();

            // act
            var result = await controller.ChangeEmail(new ChangeEmailModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.AddNormalLogin));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.GenerateChangeEmailTokenAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ChangeEmail [POST] sends email and redirects to confirmation page if request was OK")]
        public async Task T48()
        {
            // arrange
            var (controller, userManager, emailService, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds(null, "a@a.com")
                .Build();

            // act
            var result = await controller.ChangeEmail(new ChangeEmailModel()) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.ChangeEmailRequestSent));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.GenerateChangeEmailTokenAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
            emailService.Verify(x => x.GenerateChangeEmailAddressEmail(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            emailService.Verify(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "ChangeEmailConfirmation [GET] redirects to error page if email or token are missing")]
        public async Task T49()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder().Build();

            // act
            var result1 = await controller.ChangeEmailConfirmation(string.Empty, "token");
            var result2 = await controller.ChangeEmailConfirmation("a@a.com", string.Empty);

            // assert
            result1.Should().BeOfType<RedirectToActionResult>();
            result1.ActionName.Should().Be(nameof(MyAccountController.EmailChangeFailed));
            result2.Should().BeOfType<RedirectToActionResult>();
            result2.ActionName.Should().Be(nameof(MyAccountController.EmailChangeFailed));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Never);
            userManager.Verify(x => x.ChangeEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ChangeEmailConfirmation [GET] redirects to login page if user is not found")]
        public async Task T50()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserFails()
                .Build();

            // act
            var result = await controller.ChangeEmailConfirmation("a", "a");

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(AccountController.Login));
            result.ControllerName.Should().Be(AccountController.Controllername);

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.ChangeEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ChangeEmailConfirmation [GET] redirects to error page if email change was unsuccessful")]
        public async Task T51()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .ChangeEmailFails()
                .Build();

            // act
            var result = await controller.ChangeEmailConfirmation("a", "a");

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.EmailChangeFailed));

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.ChangeEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "ChangeEmailConfirmation [GET] redirects back to profile page after email was changed successfully")]
        public async Task T52()
        {
            // arrange
            var (controller, userManager, _, _) = new MyAccountControllerBuilder()
                .GetUserSucceeds()
                .ChangeEmailSucceeds()
                .Build();

            // act
            var result = await controller.ChangeEmailConfirmation("a", "a");

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.Index));
            result.RouteValues.Should().ContainKey("message");

            userManager.Verify(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()), Times.Once);
            userManager.Verify(x => x.ChangeEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }
    }
}
