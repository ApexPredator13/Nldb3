using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
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
            var controller = new AccountControllerBuilder().Build();

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
            var controller = new AccountControllerBuilder().WithAuthenticatedUser().Build();

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
            var controller = new AccountControllerBuilder().WithAuthenticatedUser().Build();

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
            var controller = new AccountControllerBuilder().Build();

            // act
            var result = await controller.Login() as ViewResult;

            // assert
            result.Should().BeOfType<ViewResult>();
        }

        [Fact(DisplayName = "Login POST redisplays view if model invalid")]
        public async Task T5()
        {
            // arrange
            var controller = new AccountControllerBuilder().Build();
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
            var controller = new AccountControllerBuilder().CannotFindUserByEmail().CannotFindUserByName().Build();
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
        }

        [Fact(DisplayName = "Login POST redisplays login form if locked out")]
        public async Task T7()
        {
            // arrange
            var controller = new AccountControllerBuilder()
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
        }

        [Fact(DisplayName = "Login POST redirects locally if SignIn succeeded")]
        public async Task T8()
        {
            // arrange
            var controller = new AccountControllerBuilder()
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
        }

        [Fact(DisplayName = "Login POST redisplays login form with unhandled signin result")]
        public async Task T9()
        {
            // arrange
            var controller = new AccountControllerBuilder()
                .CanFindUserByEmail()
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
        }
    }
}
