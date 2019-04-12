using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace WebsiteTests.Tools
{
    public class UserManagerBuilder
    {
        private readonly Mock<UserManager<IdentityUser>> _userManager;

        private readonly Mock<IUserEmailStore<IdentityUser>> _userStore;
        private readonly Mock<IOptions<IdentityOptions>> _optionsAccessor;
        private readonly Mock<IPasswordHasher<IdentityUser>> _passwordHasher;
        private readonly Mock<IUserValidator<IdentityUser>> _userValidator;
        private readonly Mock<IPasswordValidator<IdentityUser>> _passwordValidator;
        private readonly Mock<ILookupNormalizer> _lookupNormalizer;
        private readonly Mock<IServiceProvider> _serviceProvider;

        public UserManagerBuilder()
        {
            _userStore = new Mock<IUserEmailStore<IdentityUser>>();
            _optionsAccessor = new Mock<IOptions<IdentityOptions>>();
            _optionsAccessor.SetupGet(x => x.Value).Returns(new IdentityOptions());

            _passwordHasher = new Mock<IPasswordHasher<IdentityUser>>();
            _passwordHasher.Setup(x => x.HashPassword(It.IsAny<IdentityUser>(), It.IsAny<string>())).Returns("hashed password");
            _passwordHasher.Setup(x => x.VerifyHashedPassword(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>())).Returns(PasswordVerificationResult.Success);

            _userValidator = new Mock<IUserValidator<IdentityUser>>();
            _userValidator.Setup(x => x.ValidateAsync(It.IsAny<UserManager<IdentityUser>>(), It.IsAny<IdentityUser>())).ReturnsAsync(IdentityResult.Success);

            _passwordValidator = new Mock<IPasswordValidator<IdentityUser>>();
            _passwordValidator.Setup(x => x.ValidateAsync(It.IsAny<UserManager<IdentityUser>>(), It.IsAny<IdentityUser>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);

            _lookupNormalizer = new Mock<ILookupNormalizer>();
            _lookupNormalizer.Setup(x => x.Normalize(It.IsAny<string>())).Returns("normalized string");

            _serviceProvider = new Mock<IServiceProvider>();

            _userManager = new Mock<UserManager<IdentityUser>>(
                _userStore.Object,
                _optionsAccessor.Object,
                _passwordHasher.Object,
                new List<IUserValidator<IdentityUser>> { _userValidator.Object },
                new List<IPasswordValidator<IdentityUser>> { _passwordValidator.Object },
                _lookupNormalizer.Object,
                new IdentityErrorDescriber(),
                _serviceProvider.Object,
                null
            );

            // things that always succeed
            _userManager.Setup(x => x.GeneratePasswordResetTokenAsync(It.IsAny<IdentityUser>())).ReturnsAsync("x");
            _userManager.Setup(x => x.GenerateEmailConfirmationTokenAsync(It.IsAny<IdentityUser>())).ReturnsAsync("x");
        }

        public UserManagerBuilder GetUserAsyncSucceeds(string userName = null, string email = null)
        {
            _userManager.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>())).ReturnsAsync(new IdentityUser(userName) { Email = email });
            return this;
        }

        public UserManagerBuilder GetUserAsyncFails()
        {
            _userManager.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>())).ReturnsAsync((IdentityUser)null);
            return this;
        }

        public UserManagerBuilder CanFindUserByEmail()
        {
            _userManager.Setup(x => x.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(new IdentityUser());
            return this;
        }

        public UserManagerBuilder CannotFindUserByEmail()
        {
            _userManager.Setup(x => x.FindByEmailAsync(It.IsAny<string>())).Returns(Task.FromResult<IdentityUser>(null));
            return this;
        }

        public UserManagerBuilder CanFindUserByName()
        {
            _userManager.Setup(x => x.FindByNameAsync(It.IsAny<string>())).ReturnsAsync(new IdentityUser());
            return this;
        }

        public UserManagerBuilder CannotFindUserByName()
        {
            _userManager.Setup(x => x.FindByNameAsync(It.IsAny<string>())).Returns(Task.FromResult<IdentityUser>(null));
            return this;
        }

        public UserManagerBuilder CanFindUserById()
        {
            _userManager.Setup(x => x.FindByIdAsync(It.IsAny<string>())).ReturnsAsync(new IdentityUser());
            return this;
        }


        public UserManagerBuilder DeleteAsyncSucceeds()
        {
            _userManager.Setup(x => x.DeleteAsync(It.IsAny<IdentityUser>())).ReturnsAsync(IdentityResult.Success);
            return this;
        }

        public UserManagerBuilder DeleteAsyncFails()
        {
            _userManager.Setup(x => x.DeleteAsync(It.IsAny<IdentityUser>())).ReturnsAsync(IdentityResult.Failed());
            return this;
        }

        public UserManagerBuilder HasPasswordReturnsTrue()
        {
            _userManager.Setup(x => x.HasPasswordAsync(It.IsAny<IdentityUser>())).ReturnsAsync(true);
            return this;
        }

        public UserManagerBuilder HasPasswordReturnsFalse()
        {
            _userManager.Setup(x => x.HasPasswordAsync(It.IsAny<IdentityUser>())).ReturnsAsync(false);
            return this;
        }

        public UserManagerBuilder DeleteAsyncCrashes()
        {
            _userManager.Setup(x => x.DeleteAsync(It.IsAny<IdentityUser>())).ThrowsAsync(new Exception());
            return this;
        }

        public UserManagerBuilder CannotFindUserById()
        {
            _userManager.Setup(x => x.FindByIdAsync(It.IsAny<string>())).Returns(Task.FromResult<IdentityUser>(null));
            return this;
        }

        public UserManagerBuilder AddLoginAsyncSucceeds()
        {
            _userManager.Setup(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Success);
            return this;
        }

        public UserManagerBuilder AddLoginAsyncFails()
        {
            _userManager.Setup(x => x.AddLoginAsync(It.IsAny<IdentityUser>(), It.IsAny<UserLoginInfo>())).ReturnsAsync(IdentityResult.Failed());
            return this;
        }

        public UserManagerBuilder ConfirmEmailFails()
        {
            _userManager.Setup(x => x.ConfirmEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Failed());
            return this;
        }

        public UserManagerBuilder ConfirmEmailSucceeds()
        {
            _userManager.Setup(x => x.ConfirmEmailAsync(It.IsAny<IdentityUser>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);
            return this;
        }

        public UserManagerBuilder UserHasCornfirmedEmail()
        {
            _userManager.Setup(x => x.IsEmailConfirmedAsync(It.IsAny<IdentityUser>())).ReturnsAsync(true);
            return this;
        }

        public UserManagerBuilder UserHasUncornfirmedEmail()
        {
            _userManager.Setup(x => x.IsEmailConfirmedAsync(It.IsAny<IdentityUser>())).ReturnsAsync(false);
            return this;
        }

        public UserManagerBuilder ResetPasswordSucceeds()
        {
            _userManager.Setup(x => x.ResetPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);
            return this;
        }

        public UserManagerBuilder ResetPasswordFails()
        {
            _userManager.Setup(x => x.ResetPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Failed());
            return this;
        }

        public UserManagerBuilder ChangePasswordFails()
        {
            _userManager.Setup(x => x.ChangePasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Failed());
            return this;
        }

        public UserManagerBuilder ChangePasswordSucceeds()
        {
            _userManager.Setup(x => x.ChangePasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);
            return this;
        }

        public UserManagerBuilder CheckPasswordFails()
        {
            _userManager.Setup(x => x.CheckPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>())).ReturnsAsync(false);
            return this;
        }

        public UserManagerBuilder CheckPasswordSucceeds()
        {
            _userManager.Setup(x => x.CheckPasswordAsync(It.IsAny<IdentityUser>(), It.IsAny<string>())).ReturnsAsync(true);
            return this;
        }

        public UserManagerBuilder CreateAsyncSucceeds()
        {
            _userManager.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>())).ReturnsAsync(IdentityResult.Success);
            _userManager.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Success);
            return this;
        }

        public UserManagerBuilder CreateAsyncFails()
        {
            _userManager.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>())).ReturnsAsync(IdentityResult.Failed());
            _userManager.Setup(x => x.CreateAsync(It.IsAny<IdentityUser>(), It.IsAny<string>())).ReturnsAsync(IdentityResult.Failed());
            return this;
        }

        public UserManager<IdentityUser> GetMockedObject() => _userManager.Object;
        public Mock<UserManager<IdentityUser>> GetMock() => _userManager;
    }
}
