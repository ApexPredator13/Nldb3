using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Website.Controllers;
using Website.Models.Account;
using Website.Services;

namespace WebsiteTests.Tools
{
    public class FakeTempDataSerializer : TempDataSerializer
    {
        public override IDictionary<string, object> Deserialize(byte[] unprotectedData) => new Dictionary<string, object>();
        public override byte[] Serialize(IDictionary<string, object> values) => new byte[0];
    }

    public class AccountControllerBuilder
    {
        private readonly AccountController _controller;
        private readonly Mock<IServiceProvider> _httpContextServiceProvider;
        private readonly UserManagerBuilder _userManager;
        private readonly SigninManagerBuilder _signinManager;
        private readonly Mock<IEmailService> _emailService;

        public AccountControllerBuilder()
        {
            // assume SignOutAsync() always succeeds
            var authService = new Mock<IAuthenticationService>();
            authService.Setup(x => x.SignOutAsync(It.IsAny<HttpContext>(), It.IsAny<string>(), It.IsAny<AuthenticationProperties>())).Returns(Task.CompletedTask);

            // fake service provider the default HttpContext will use, needs IUrlHelperFactory and ITempDataDictionaryFactory to function,
            // additionally IAuthenticationService is added to get HttpContext.SignOutAsync() to work
            _httpContextServiceProvider = new Mock<IServiceProvider>();
            _httpContextServiceProvider.Setup(x => x.GetService(typeof(IAuthenticationService))).Returns(authService.Object);
            _httpContextServiceProvider.Setup(sp => sp.GetService(typeof(IUrlHelperFactory))).Returns(new UrlHelperFactory());
            _httpContextServiceProvider.Setup(sp => sp.GetService(typeof(ITempDataDictionaryFactory))).Returns(new TempDataDictionaryFactory(new SessionStateTempDataProvider(new FakeTempDataSerializer())));

            var httpContext = new DefaultHttpContext()
            {
                RequestServices = _httpContextServiceProvider.Object
            };

            // fake url helper
            var urlHelper = new Mock<IUrlHelper>(MockBehavior.Strict);
            urlHelper.Setup(x => x.Action(It.IsAny<UrlActionContext>())).Returns("some url");

            _userManager = new UserManagerBuilder();
            _signinManager = new SigninManagerBuilder(_userManager.GetMockedObject(), httpContext);

            // fake email sender that always succeeds
            _emailService = new Mock<IEmailService>();
            _emailService.Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);
            _emailService.Setup(x => x.GenerateResetPasswordEmail(It.IsAny<ForgotPasswordModel>(), It.IsAny<string>())).Returns("x");
            _emailService.Setup(x => x.GenerateConfirmEmailAddressEmail(It.IsAny<string>(), It.IsAny<string>())).Returns("x");

            _controller = new AccountController(_signinManager.GetMockedObject(), _userManager.GetMockedObject(), _emailService.Object)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = httpContext,
                    ActionDescriptor = new ControllerActionDescriptor(),
                    RouteData = new RouteData(),
                },
                Url = urlHelper.Object
            };
        }

        public AccountControllerBuilder WithAuthenticatedUser(Dictionary<string, string> additionalClaims = null)
        {
            if (additionalClaims is null)
            {
                additionalClaims = new Dictionary<string, string>
                {
                    { ClaimTypes.NameIdentifier, "x" }
                };
            }

            var finalClaims = new List<Claim>();
            foreach (var additionalClaim in additionalClaims)
            {
                finalClaims.Add(new Claim(additionalClaim.Key, additionalClaim.Value));
            }

            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(new List<ClaimsIdentity>
            {
                new ClaimsIdentity(finalClaims, "some authentication schema")
            });

            _controller.ControllerContext.HttpContext.User.AddIdentity(new ClaimsIdentity(finalClaims));

            return this;
        }

        public AccountControllerBuilder PasswordSignInFails()
        {
            _signinManager.PasswordSignInFails();
            return this;
        }

        public AccountControllerBuilder PasswordSignInFailsLockedOut()
        {
            _signinManager.PasswordSignInFailsLockedOut();
            return this;
        }

        public AccountControllerBuilder PasswordSignInSucceeds()
        {
            _signinManager.PasswordSignInSucceeds();
            return this;
        }

        public AccountControllerBuilder PasswordSignInFailsNotAllowed()
        {
            _signinManager.PasswordSignInFailsNotAllowed();
            return this;
        }

        public AccountControllerBuilder CanFindUserByEmail()
        {
            _userManager.CanFindUserByEmail();
            return this;
        }

        public AccountControllerBuilder CannotFindUserByEmail()
        {
            _userManager.CannotFindUserByEmail();
            return this;
        }

        public AccountControllerBuilder CanFindUserById()
        {
            _userManager.CanFindUserById();
            return this;
        }

        public AccountControllerBuilder CannotFindUserById()
        {
            _userManager.CannotFindUserById();
            return this;
        }

        public AccountControllerBuilder CanFindUserByName()
        {
            _userManager.CanFindUserByName();
            return this;
        }

        public AccountControllerBuilder CannotFindUserByName()
        {
            _userManager.CannotFindUserByName();
            return this;
        }

        public AccountControllerBuilder ConfirmEmailFails()
        {
            _userManager.ConfirmEmailFails();
            return this;
        }

        public AccountControllerBuilder ConfirmEmailSucceeds()
        {
            _userManager.ConfirmEmailSucceeds();
            return this;
        }

        public AccountControllerBuilder CanConfigureAuthenticationProperties(Dictionary<string, string> values)
        {
            _signinManager.CanConfigureAuthenticationProperties(values);
            return this;
        }

        public AccountControllerBuilder GetExternalLoginInfoAsyncFails()
        {
            _signinManager.GetExternalLoginInfoAsyncFails();
            return this;
        }

        public AccountControllerBuilder GetExternalLoginInfoAsyncSucceeds()
        {
            _signinManager.GetExternalLoginInfoAsyncSucceeds();
            return this;
        }

        public AccountControllerBuilder ExternalLoginSignInAsyncFailsLockedOut()
        {
            _signinManager.ExternalLoginSignInAsyncFailsLockedOut();
            return this;
        }

        public AccountControllerBuilder ExternalLoginSignInAsyncFails()
        {
            _signinManager.ExternalLoginSignInAsyncFails();
            return this;
        }

        public AccountControllerBuilder ExternalLoginSignInAsyncSucceeds()
        {
            _signinManager.ExternalLoginSignInAsyncSucceeds();
            return this;
        }

        public AccountControllerBuilder CreateUserFails()
        {
            _userManager.CreateAsyncFails();
            return this;
        }

        public AccountControllerBuilder CreateUserSucceeds()
        {
            _userManager.CreateAsyncSucceeds();
            return this;
        }

        public AccountControllerBuilder CanAddLoginToUser()
        {
            _userManager.AddLoginAsyncSucceeds();
            return this;
        }

        public AccountControllerBuilder CannotAddLoginToUser()
        {
            _userManager.AddLoginAsyncFails();
            return this;
        }

        public AccountControllerBuilder CanSignIn()
        {
            _signinManager.SignInAsyncSucceeds();
            return this;
        }

        public AccountControllerBuilder DeleteUserProfileSucceeds()
        {
            _userManager.DeleteAsyncSucceeds();
            return this;
        }

        public AccountControllerBuilder DeleteUserProfileCrashes()
        {
            _userManager.DeleteAsyncCrashes();
            return this;
        }

        public AccountControllerBuilder UserHasCornfirmedEmail()
        {
            _userManager.UserHasCornfirmedEmail();
            return this;
        }

        public AccountControllerBuilder UserHasUncornfirmedEmail()
        {
            _userManager.UserHasUncornfirmedEmail();
            return this;
        }

        public AccountControllerBuilder ResetPasswordSucceeds()
        {
            _userManager.ResetPasswordSucceeds();
            return this;
        }

        public AccountControllerBuilder ResetPasswordFails()
        {
            _userManager.ResetPasswordFails();
            return this;
        }

        public (AccountController controller, Mock<UserManager<IdentityUser>> userManager, Mock<SignInManager<IdentityUser>> signInManager, Mock<IEmailService> emailService) Build() 
            => (_controller, _userManager.GetMock(), _signinManager.GetMock(), _emailService);
    }

    public class MyAccountControllerBuilder
    {
        private readonly MyAccountController _controller;
        private readonly Mock<IEmailService> _emailService;
        private readonly UserManagerBuilder _userManager;
        private readonly SigninManagerBuilder _signInManager;
        private readonly Mock<IServiceProvider> _httpContextServiceProvider;

        public MyAccountControllerBuilder()
        {
            _emailService = new Mock<IEmailService>();
            _emailService.Setup(x => x.GenerateConfirmEmailAddressEmail(It.IsAny<string>(), It.IsAny<string>())).Returns("x");
            _emailService.Setup(x => x.GenerateResetPasswordEmail(It.IsAny<ForgotPasswordModel>(), It.IsAny<string>())).Returns("x");
            _emailService.Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);

            var authService = new Mock<IAuthenticationService>();
            authService.Setup(x => x.SignOutAsync(It.IsAny<HttpContext>(), It.IsAny<string>(), It.IsAny<AuthenticationProperties>())).Returns(Task.CompletedTask);

            _httpContextServiceProvider = new Mock<IServiceProvider>();
            _httpContextServiceProvider.Setup(x => x.GetService(typeof(IAuthenticationService))).Returns(authService.Object);
            _httpContextServiceProvider.Setup(sp => sp.GetService(typeof(IUrlHelperFactory))).Returns(new UrlHelperFactory());
            _httpContextServiceProvider.Setup(sp => sp.GetService(typeof(ITempDataDictionaryFactory))).Returns(new TempDataDictionaryFactory(new SessionStateTempDataProvider(new FakeTempDataSerializer())));

            var urlHelper = new Mock<IUrlHelper>(MockBehavior.Strict);
            urlHelper.Setup(x => x.Action(It.IsAny<UrlActionContext>())).Returns("some url");

            var context = new DefaultHttpContext()
            {
                RequestServices = _httpContextServiceProvider.Object
            };

            _userManager = new UserManagerBuilder();
            _signInManager = new SigninManagerBuilder(_userManager.GetMockedObject(), context);

            _controller = new MyAccountController(_userManager.GetMockedObject(), _emailService.Object, _signInManager.GetMockedObject())
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = context
                },
                Url = urlHelper.Object
            };
        }

        public MyAccountControllerBuilder WithAuthenticatedUser(Dictionary<string, string> additionalClaims = null)
        {
            if (additionalClaims is null)
            {
                additionalClaims = new Dictionary<string, string>
                {
                    { ClaimTypes.NameIdentifier, "x" }
                };
            }

            var finalClaims = new List<Claim>();
            foreach (var additionalClaim in additionalClaims)
            {
                finalClaims.Add(new Claim(additionalClaim.Key, additionalClaim.Value));
            }

            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(new List<ClaimsIdentity>
            {
                new ClaimsIdentity(finalClaims, "some authentication schema")
            });

            _controller.ControllerContext.HttpContext.User.AddIdentity(new ClaimsIdentity(finalClaims));

            return this;
        }

        public MyAccountControllerBuilder GetUserFails()
        {
            _userManager.GetUserAsyncFails();
            return this;
        }

        public MyAccountControllerBuilder GetUserSucceeds(string userName = null, string email = null)
        {
            _userManager.GetUserAsyncSucceeds(userName, email);
            return this;
        }

        public MyAccountControllerBuilder UserHasNoPassword()
        {
            _userManager.HasPasswordReturnsFalse();
            return this;
        }

        public MyAccountControllerBuilder UserHasPassword()
        {
            _userManager.HasPasswordReturnsTrue();
            return this;
        }

        public MyAccountControllerBuilder ChangePasswordSucceeds()
        {
            _userManager.ChangePasswordSucceeds();
            return this;
        }

        public MyAccountControllerBuilder ChangePasswordFails()
        {
            _userManager.ChangePasswordFails();
            return this;
        }

        public MyAccountControllerBuilder CheckPasswordSucceeds()
        {
            _userManager.CheckPasswordSucceeds();
            return this;
        }

        public MyAccountControllerBuilder CheckPasswordFails()
        {
            _userManager.CheckPasswordFails();
            return this;
        }

        public MyAccountControllerBuilder DeleteUserProfileFails()
        {
            _userManager.DeleteAsyncFails();
            return this;
        }

        public MyAccountControllerBuilder DeleteUserProfileSucceeds()
        {
            _userManager.DeleteAsyncSucceeds();
            return this;
        }

        public MyAccountControllerBuilder RemoveLoginFails()
        {
            _userManager.RemoveLoginFails();
            return this;
        }

        public MyAccountControllerBuilder RemoveLoginSucceeds()
        {
            _userManager.RemoveLoginSucceeds();
            return this;
        }

        public MyAccountControllerBuilder GetExternalLoginInfoAsyncFails()
        {
            _signInManager.GetExternalLoginInfoAsyncFails();
            return this;
        }

        public MyAccountControllerBuilder GetExternalLoginInfoAsyncSucceeds()
        {
            _signInManager.GetExternalLoginInfoAsyncSucceeds();
            return this;
        }

        public MyAccountControllerBuilder CanAddLoginToUser()
        {
            _userManager.AddLoginAsyncSucceeds();
            return this;
        }

        public MyAccountControllerBuilder CannotAddLoginToUser()
        {
            _userManager.AddLoginAsyncFails();
            return this;
        }

        public MyAccountControllerBuilder SetEmailSucceeds()
        {
            _userManager.SetEmailSucceeds();
            return this;
        }

        public MyAccountControllerBuilder SetEmailFails()
        {
            _userManager.SetEmailFails();
            return this;
        }

        public MyAccountControllerBuilder AddPasswordSucceeds()
        {
            _userManager.AddPasswordSucceeds();
            return this;
        }

        public MyAccountControllerBuilder AddPasswordFails()
        {
            _userManager.AddPasswordFails();
            return this;
        }

        public MyAccountControllerBuilder ChangeEmailSucceeds()
        {
            _userManager.ChangeEmailSucceeds();
            return this;
        }

        public MyAccountControllerBuilder ChangeEmailFails()
        {
            _userManager.ChangeEmailFails();
            return this;
        }

        public MyAccountControllerBuilder SetUsernameSucceeds()
        {
            _userManager.SetUsernameSucceeds();
            return this;
        }

        public MyAccountControllerBuilder SetUsernameFails()
        {
            _userManager.SetUsernameFails();
            return this;
        }

        public (MyAccountController controller, Mock<UserManager<IdentityUser>> userManager, Mock<IEmailService> emailService, Mock<SignInManager<IdentityUser>> signInManager) Build()
        {
            return (_controller, _userManager.GetMock(), _emailService, _signInManager.GetMock());
        }
    }
}
