using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Controllers;
using Website.Models.Account;
using WebsiteTests.Tools;
using Xunit;

namespace WebsiteTests.Controllers
{
    public class AccountControllerTests
    {
        [Fact(DisplayName = "Index() redirects to login if user is not logged in")]
        public void T1()
        {
            // arrange
            var (controller, _, _, _) = new AccountControllerBuilder().Build();

            // act
            var result = controller.Index();

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.Login));
        }

        [Fact(DisplayName = "Index() redirects to private account page if user is logged in")]
        public void T2()
        {
            // arrange
            var (controller, _, _, _) = new AccountControllerBuilder().WithAuthenticatedUser().Build();

            // act
            var result = controller.Index() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.Index));
            result.ControllerName.Should().Be(MyAccountController.Controllername);
        }

        [Fact(DisplayName = "Login GET redirects to private account page if user is logged in")]
        public async Task T3()
        {
            // arrange
            var (controller, _, _, _) = new AccountControllerBuilder().WithAuthenticatedUser().Build();

            // act
            var result = await controller.Login() as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>();
            result.ActionName.Should().Be(nameof(MyAccountController.Index));
            result.ControllerName.Should().Be(MyAccountController.Controllername);
        }

        [Fact(DisplayName = "Login GET shows login form if user is not logged in")]
        public async Task T4()
        {
            // arrange
            var (controller, _, _, _) = new AccountControllerBuilder().Build();

            // act
            var result = await controller.Login() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
        }

        [Fact(DisplayName = "Login POST redisplays view if model invalid")]
        public async Task T5()
        {
            // arrange
            var (controller, _, _, _) = new AccountControllerBuilder().Build();
            controller.ModelState.AddModelError("some", "error");
            var model = new LoginModel
            {
                EmailOrUsername = "name",
                Password = "pass",
                RememberMe = true
            };

            // act
            var result = await controller.Login(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);
            result.ViewData.ModelState.IsValid.Should().BeFalse();
        }

        [Fact(DisplayName = "Login POST redisplays login form if user wasn't found")]
        public async Task T6()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .CannotFindUserByEmail()
                .CannotFindUserByName()
                .Build();

            var model = new LoginModel
            {
                EmailOrUsername = "name",
                Password = "pass",
                RememberMe = true
            };

            // act
            var result = await controller.Login(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);
            result.ViewData.ModelState.IsValid.Should().BeFalse();

            userManager.Verify(x => x.FindByEmailAsync("name"), Times.Once);
            userManager.Verify(x => x.FindByNameAsync("name"), Times.Once);
            signInManager.Verify(x => x.PasswordSignInAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Never);
            signInManager.Verify(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Never);
        }

        [Fact(DisplayName = "Login POST redisplays login form if locked out")]
        public async Task T7()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .CanFindUserByEmail()
                .PasswordSignInFailsLockedOut()
                .Build();

            var model = new LoginModel
            {
                EmailOrUsername = "name",
                Password = "pass",
                RememberMe = true
            };

            // act
            var result = await controller.Login(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();
            result.Model.Should().BeEquivalentTo(model);
            result.ViewData.ModelState.IsValid.Should().BeFalse();

            userManager.Verify(x => x.FindByEmailAsync("name"), Times.Once);    // user was found by email
            userManager.Verify(x => x.FindByNameAsync("name"), Times.Never);    // ...so find by name was never called
            signInManager.Verify(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
        }

        [Fact(DisplayName = "Login POST redirects locally if SignIn succeeded")]
        public async Task T8()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .CanFindUserByEmail()
                .PasswordSignInSucceeds()
                .Build();

            var model = new LoginModel
            {
                EmailOrUsername = "name",
                Password = "pass",
                RememberMe = true
            };

            // act
            var result = await controller.Login(model) as LocalRedirectResult;

            // assert
            result.Should().BeOfType<LocalRedirectResult>();

            userManager.Verify(x => x.FindByEmailAsync("name"), Times.Once);    // user was found by email
            userManager.Verify(x => x.FindByNameAsync("name"), Times.Never);    // ...so find by name was never called
            signInManager.Verify(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
        }

        [Fact(DisplayName = "Login POST redisplays login form with unhandled signin result")]
        public async Task T9()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .CannotFindUserByEmail()
                .CanFindUserByName()
                .PasswordSignInFailsNotAllowed()
                .Build();

            var model = new LoginModel
            {
                EmailOrUsername = "name",
                Password = "pass",
                RememberMe = true
            };

            // act
            var result = await controller.Login(model) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
            result.Model.Should().BeEquivalentTo(model);

            userManager.Verify(x => x.FindByEmailAsync("name"), Times.Once);    // user was not found by email
            userManager.Verify(x => x.FindByNameAsync("name"), Times.Once);     // ...so find by name was also called
            signInManager.Verify(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
        }

        [Fact(DisplayName = "ConfirmEmail redirects to error page if code or user id is null or empty")]
        public async Task T10()
        {
            // arrange
            var (controller, userManager, _, _) = new AccountControllerBuilder().Build();

            // act
            var result1 = await controller.ConfirmEmail(null, "x");
            var result2 = await controller.ConfirmEmail("x", null);

            // assert
            result1.Should().BeOfType<RedirectToActionResult>().Which.ActionName.Should().Be(nameof(AccountController.ConfirmEmailFailed));
            result2.Should().BeOfType<RedirectToActionResult>().Which.ActionName.Should().Be(nameof(AccountController.ConfirmEmailFailed));

            userManager.Verify(x => x.FindByIdAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ConfirmEmail redirects to error page if user was not found")]
        public async Task T11()
        {
            // arrange
            var (controller, userManager, _, _) = new AccountControllerBuilder()
                .CannotFindUserById()
                .Build();

            // act
            var result = await controller.ConfirmEmail("x", "y");

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ConfirmEmailFailed));

            userManager.Verify(x => x.FindByIdAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.ConfirmEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ConfirmEmail redirects to error page if confirmation fails")]
        public async Task T12()
        {
            // arrange
            var (controller, userManager, _, _) = new AccountControllerBuilder()
                .CanFindUserById()
                .ConfirmEmailFails()
                .Build();

            // act
            var result = await controller.ConfirmEmail("x", "y");

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ConfirmEmailFailed));

            userManager.Verify(x => x.FindByIdAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.ConfirmEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "ConfirmEmail returns view if confirmation succeeds")]
        public async Task T13()
        {
            // arrange
            var (controller, userManager, _, _) = new AccountControllerBuilder()
                .CanFindUserById()
                .ConfirmEmailSucceeds()
                .Build();

            // act
            var result = await controller.ConfirmEmail("x", "y");

            // assert
            result.Should().BeOfType<ViewResult>()
                .Which.ViewName.Should().BeNull();

            userManager.Verify(x => x.FindByIdAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.ConfirmEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "ExternalLogin returns ChallengeResult with correct provider and returnUrl")]
        public void T14()
        {
            // arrange
            var properties = new Dictionary<string, string>() { { "returnUrl", "some url" } };
            var (controller, _, _, _) = new AccountControllerBuilder().CanConfigureAuthenticationProperties(properties).Build();

            // act
            var result = controller.ExternalLogin("google", "some url");

            // assert
            result.Should().BeOfType<ChallengeResult>();
            result.Properties.Items.Should().ContainKey("returnUrl").WhichValue.Should().Be("some url");
            result.AuthenticationSchemes.Should().Contain("google");
        }

        [Fact(DisplayName = "ExternalLoginCallback [GET] redirects to error page if remote error was returned")]
        public async Task T15()
        {
            // arrange
            var (controller, _, signInManager, _) = new AccountControllerBuilder().Build();

            // act
            var result = await controller.ExternalLoginCallback((string)null, "some remote error");

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ExternalLoginFailed));

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ExternalLoginCallback [GET] redirects to error page if login info is null")]
        public async Task T16()
        {
            // arrange
            var (controller, _, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncFails()
                .Build();

            // act
            var result = await controller.ExternalLoginCallback((string)null, null);

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ExternalLoginFailed));

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>()), Times.Never);
            signInManager.Verify(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Never);
        }

        [Fact(DisplayName = "ExternalLoginCallback [GET] returns LocalRedirect if SignIn succeeds")]
        public async Task T17()
        {
            // arrange
            var (controller, _, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncSucceeds()
                .ExternalLoginSignInAsyncSucceeds()
                .Build();

            // act
            var result = await controller.ExternalLoginCallback((string)null, null);

            // assert
            result.Should().BeOfType<LocalRedirectResult>();

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
        }

        [Fact(DisplayName = "ExternalLoginCallback [GET] redirects to error page if user is locked out")]
        public async Task T18()
        {
            // arrange
            var (controller, _, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncSucceeds()
                .ExternalLoginSignInAsyncFailsLockedOut()
                .Build();

            // act
            var result = await controller.ExternalLoginCallback((string)null, null) as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>().Which.ActionName.Should().Be(nameof(AccountController.ExternalLoginFailed));
            result.RouteValues.Should().ContainKey("error").WhichValue.Should().NotBeNull();

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
        }

        [Fact(DisplayName = "ExternalLoginCallback [GET] shows 'choose username' form if external login worked but user was never here before")]
        public async Task T19()
        {
            // arrange
            var (controller, _, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncSucceeds()
                .ExternalLoginSignInAsyncFails()
                .Build();

            // act
            var result = await controller.ExternalLoginCallback((string)null, null) as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();
            result.ViewData.Should().ContainKey("returnUrl");
            result.Model.Should().NotBeNull().And.BeOfType<ExternalLoginCallbackModel>();

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            signInManager.Verify(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>()), Times.Once);
        }

        [Fact(DisplayName = "ExternalLoginCallback [POST] redisplays form if model is invalid")]
        public async Task T20()
        {
            // arrange
            var (controller, _, signInManager, _) = new AccountControllerBuilder().Build();
            controller.ModelState.AddModelError("some", "error");
            var model = new ExternalLoginCallbackModel("google") { UserName = "x" };

            // act
            var result = await controller.ExternalLoginCallback(model, "some returnUrl") as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();
            result.ViewData.Should().ContainKey("returnUrl").WhichValue.Should().Be("some returnUrl");
            result.Model.Should().BeEquivalentTo(model);

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ExternalLoginCallback [POST] redirects to error page if login info cannot be found anymore")]
        public async Task T21()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder().GetExternalLoginInfoAsyncFails().Build();
            var model = new ExternalLoginCallbackModel("google") { UserName = "x" };

            // act
            var result = await controller.ExternalLoginCallback(model, "some returnUrl") as RedirectToActionResult;

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ExternalLoginFailed));

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.CreateAsync(It.IsAny<IdentityUser>()), Times.Never);
        }

        [Fact(DisplayName = "ExternalLoginCallback [POST] redisplays form if profile cannot be created")]
        public async Task T22()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncSucceeds()
                .CreateUserFails()
                .Build();

            var model = new ExternalLoginCallbackModel("google") { UserName = "x" };

            // act
            var result = await controller.ExternalLoginCallback(model, "some returnUrl") as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();
            result.ViewData.Should().ContainKey("returnUrl").WhichValue.Should().Be("some returnUrl");
            result.Model.Should().BeEquivalentTo(model);

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.CreateAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>()), Times.Never);
        }

        [Fact(DisplayName = "ExternalLoginCallback [POST] redisplays form if profile can be created, but login info cannot be added")]
        public async Task T23()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncSucceeds()
                .CreateUserSucceeds()
                .CannotAddLoginToUser()
                .DeleteUserProfileSucceeds()
                .Build();

            var model = new ExternalLoginCallbackModel("google") { UserName = "x" };

            // act
            var result = await controller.ExternalLoginCallback(model, "some returnUrl") as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();
            result.ViewData.Should().ContainKey("returnUrl").WhichValue.Should().Be("some returnUrl");
            result.Model.Should().BeEquivalentTo(model);

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.CreateAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Once);
            signInManager.Verify(x => x.SignInAsync(It.IsAny<IdentityUser>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ExternalLoginCallback [POST] redisplays form if profile can be created, but login info cannot be added, even if usermanager crashes!")]
        public async Task T24()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncSucceeds()
                .CreateUserSucceeds()
                .CannotAddLoginToUser()
                .DeleteUserProfileCrashes()
                .Build();

            var model = new ExternalLoginCallbackModel("google") { UserName = "x" };

            // act
            var result = await controller.ExternalLoginCallback(model, "some returnUrl") as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();
            result.ViewData.Should().ContainKey("returnUrl").WhichValue.Should().Be("some returnUrl");
            result.Model.Should().BeEquivalentTo(model);

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.CreateAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Once);
            signInManager.Verify(x => x.SignInAsync(It.IsAny<IdentityUser>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ExternalLoginCallback [POST] redirects to returnUrl if user was created and logged in successfully")]
        public async Task T25()
        {
            // arrange
            var (controller, userManager, signInManager, _) = new AccountControllerBuilder()
                .GetExternalLoginInfoAsyncSucceeds()
                .CreateUserSucceeds()
                .CanAddLoginToUser()
                .CanSignIn()
                .Build();

            var model = new ExternalLoginCallbackModel("google") { UserName = "x" };

            // act
            var result = await controller.ExternalLoginCallback(model, "some returnUrl") as LocalRedirectResult;

            // assert
            result.Should().BeOfType<LocalRedirectResult>();

            signInManager.Verify(x => x.GetExternalLoginInfoAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.CreateAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>()), Times.Once);
            userManager.Verify(x => x.DeleteAsync(It.IsAny<IdentityUser>()), Times.Never);
            signInManager.Verify(x => x.SignInAsync(It.IsAny<IdentityUser>(), It.IsAny<bool>(), It.IsAny<string>()), Times.Once);
        }

        [Fact(DisplayName = "ForgotPassword [POST] redisplays view if model is invalid")]
        public async Task T26()
        {
            // arrange
            var (controller, userManager, _, emailService) = new AccountControllerBuilder().Build();
            controller.ModelState.AddModelError("some", "error");

            // act
            var result = await controller.ForgotPassword(new ForgotPasswordModel());

            // assert
            result.Should().BeOfType<ViewResult>().Which.ViewName.Should().BeNull();

            userManager.Verify(x => x.FindByEmailAsync(It.IsAny<string>()), Times.Never);
            emailService.Verify(x => x.GenerateResetPasswordEmail(It.IsAny<ForgotPasswordModel>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ForgotPassword [POST] redircts to 'email sent' without sending the email if user with this email does not exist")]
        public async Task T27()
        {
            // arrange
            var (controller, userManager, _, emailService) = new AccountControllerBuilder()
                .CannotFindUserByEmail()
                .Build();

            // act
            var result = await controller.ForgotPassword(new ForgotPasswordModel());

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ForgotPasswordEmailSent));

            userManager.Verify(x => x.FindByEmailAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.IsEmailConfirmedAsync(It.IsAny<IdentityUser>()), Times.Never);
            emailService.Verify(x => x.GenerateResetPasswordEmail(It.IsAny<ForgotPasswordModel>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ForgotPassword [POST] redircts to 'email sent' without sending the email if user has unconfirmed email")]
        public async Task T28()
        {
            // arrange
            var (controller, userManager, _, emailService) = new AccountControllerBuilder()
                .CanFindUserByEmail()
                .UserHasUncornfirmedEmail()
                .Build();

            // act
            var result = await controller.ForgotPassword(new ForgotPasswordModel());

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ForgotPasswordEmailSent));

            userManager.Verify(x => x.FindByEmailAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.IsEmailConfirmedAsync(It.IsAny<IdentityUser>()), Times.Once);
            emailService.Verify(x => x.GenerateResetPasswordEmail(It.IsAny<ForgotPasswordModel>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Fact(DisplayName = "ForgotPassword [POST] redircts to 'email sent' if everything is OK")]
        public async Task T29()
        {
            // arrange
            var (controller, userManager, _, emailService) = new AccountControllerBuilder()
                .CanFindUserByEmail()
                .UserHasCornfirmedEmail()
                .Build();

            // act
            var result = await controller.ForgotPassword(new ForgotPasswordModel());

            // assert
            result.Should().BeOfType<RedirectToActionResult>()
                .Which.ActionName.Should().Be(nameof(AccountController.ForgotPasswordEmailSent));

            userManager.Verify(x => x.FindByEmailAsync(It.IsAny<string>()), Times.Once);
            userManager.Verify(x => x.IsEmailConfirmedAsync(It.IsAny<IdentityUser>()), Times.Once);
            userManager.Verify(x => x.GeneratePasswordResetTokenAsync(It.IsAny<IdentityUser>()), Times.Once);
            emailService.Verify(x => x.GenerateResetPasswordEmail(It.IsAny<ForgotPasswordModel>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            emailService.Verify(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        }
    }
}
