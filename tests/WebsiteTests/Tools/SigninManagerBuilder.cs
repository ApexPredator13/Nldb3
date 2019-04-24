using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

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
            _userClaimsPrincipalFactory.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>())).ReturnsAsync(new ClaimsPrincipal(
                new List<ClaimsIdentity>
                {
                    new ClaimsIdentity(new List<Claim>
                        {
                            new Claim(ClaimTypes.NameIdentifier, "x"),
                            new Claim(ClaimTypes.Name, "a"),
                            new Claim(ClaimTypes.Email, "b")
                        })
                }));

            _identityOptions = new Mock<IOptions<IdentityOptions>>();
            _identityOptions.SetupGet(x => x.Value).Returns(new IdentityOptions());

            _signinManager = new Mock<SignInManager<IdentityUser>>(userManager, _httpContextAccessor.Object, _userClaimsPrincipalFactory.Object, _identityOptions.Object, null, null, null);
            
            // things that never fail
            _signinManager.Setup(x => x.SignOutAsync()).Returns(Task.CompletedTask);
            _signinManager.Setup(x => x.SignInAsync(It.IsAny<IdentityUser>(), It.IsAny<bool>(), It.IsAny<string>())).Returns(Task.CompletedTask);
            _signinManager.Setup(x => x.SignInAsync(It.IsAny<IdentityUser>(), It.IsAny<AuthenticationProperties>(), It.IsAny<string>())).Returns(Task.CompletedTask);
            _signinManager.Setup(x => x.RefreshSignInAsync(It.IsAny<IdentityUser>())).Returns(Task.CompletedTask);
            _signinManager.Setup(x => x.GetExternalAuthenticationSchemesAsync()).ReturnsAsync(new List<AuthenticationScheme>());
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

        public SigninManagerBuilder CanConfigureAuthenticationProperties(Dictionary<string, string> values)
        {
            _signinManager.Setup(x => x.ConfigureExternalAuthenticationProperties(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(new AuthenticationProperties(values));
            return this;
        }

        public SigninManagerBuilder GetExternalLoginInfoAsyncFails()
        {
            _signinManager.Setup(x => x.GetExternalLoginInfoAsync(It.IsAny<string>())).Returns(Task.FromResult<ExternalLoginInfo>(null));
            return this;
        }

        public SigninManagerBuilder GetExternalLoginInfoAsyncSucceeds()
        {
            _signinManager.Setup(x => x.GetExternalLoginInfoAsync(It.IsAny<string>())).ReturnsAsync(new ExternalLoginInfo(new ClaimsPrincipal(), "google", "google", "google"));
            return this;
        }

        public SigninManagerBuilder ExternalLoginSignInAsyncFailsLockedOut()
        {
            _signinManager.Setup(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.LockedOut);
            _signinManager.Setup(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.LockedOut);
            return this;
        }

        public SigninManagerBuilder ExternalLoginSignInAsyncFails()
        {
            _signinManager.Setup(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Failed);
            _signinManager.Setup(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Failed);
            return this;
        }

        public SigninManagerBuilder SignInAsyncSucceeds()
        {
            _signinManager.Setup(x => x.SignInAsync(It.IsAny<IdentityUser>(), It.IsAny<bool>(), It.IsAny<string>())).Returns(Task.CompletedTask);
            _signinManager.Setup(x => x.SignInAsync(It.IsAny<IdentityUser>(), It.IsAny<AuthenticationProperties>(), It.IsAny<string>())).Returns(Task.CompletedTask);
            return this;
        }

        public SigninManagerBuilder ExternalLoginSignInAsyncSucceeds()
        {
            _signinManager.Setup(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Success);
            _signinManager.Setup(x => x.ExternalLoginSignInAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<bool>())).ReturnsAsync(SignInResult.Success);
            return this;
        }

        public SignInManager<IdentityUser> GetMockedObject() => _signinManager.Object;
        public Mock<SignInManager<IdentityUser>> GetMock() => _signinManager;
    }
}
