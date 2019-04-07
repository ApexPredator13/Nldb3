using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Website.Controllers;

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

        public AccountControllerBuilder()
        {
            // assume SignOutAsync() always succeeds
            var authService = new Mock<IAuthenticationService>();
            authService.Setup(x => x.SignOutAsync(It.IsAny<HttpContext>(), It.IsAny<string>(), It.IsAny<AuthenticationProperties>())).Returns(Task.CompletedTask);

            // fake service provider for the HttpContext
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

            _controller = new AccountController(_signinManager.GetMockedObject(), _userManager.GetMockedObject())
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

        public AccountController Build() => _controller;
    }
}
