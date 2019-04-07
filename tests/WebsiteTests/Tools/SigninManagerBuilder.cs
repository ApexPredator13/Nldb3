using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using System.Collections.Generic;
using System.Security.Claims;

namespace WebsiteTests.Tools
{
    public class SigninManagerBuilder
    {
        private readonly Mock<SignInManager<IdentityUser>> _signinManager;

        private readonly Mock<IHttpContextAccessor> _httpContextAccessor;
        private readonly Mock<IUserClaimsPrincipalFactory<IdentityUser>> _userClaimsPrincipalFactory;
        private readonly Mock<IOptions<IdentityOptions>> _identityOptions;

        public SigninManagerBuilder(UserManager<IdentityUser> userManager, HttpContext context)
        {
            _httpContextAccessor = new Mock<IHttpContextAccessor>();
            _httpContextAccessor.SetupGet(x => x.HttpContext).Returns(context);

            _userClaimsPrincipalFactory = new Mock<IUserClaimsPrincipalFactory<IdentityUser>>();
            _userClaimsPrincipalFactory.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>())).ReturnsAsync(new ClaimsPrincipal());

            _identityOptions = new Mock<IOptions<IdentityOptions>>();
            _identityOptions.SetupGet(x => x.Value).Returns(new IdentityOptions());

            _signinManager = new Mock<SignInManager<IdentityUser>>(userManager, _httpContextAccessor.Object, _userClaimsPrincipalFactory.Object, _identityOptions.Object, null, null);
        }

        public SigninManagerBuilder PasswordSignInSucceeds()
        {
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Success);
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Success);
            return this;
        }

        public SigninManagerBuilder PasswordSignInFails()
        {
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Failed);
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Failed);
            return this;
        }

        public SigninManagerBuilder PasswordSignInFailsLockedOut()
        {
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.LockedOut);
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.LockedOut);
            return this;
        }

        public SigninManagerBuilder PasswordSignInFailsNotAllowed()
        {
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.NotAllowed);
            _signinManager.Setup(x => x.PasswordSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.NotAllowed);
            return this;
        }

        public SignInManager<IdentityUser> GetMockedObject() => _signinManager.Object;
    }
}
