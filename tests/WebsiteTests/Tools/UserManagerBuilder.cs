﻿using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
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

        public UserManager<IdentityUser> GetMockedObject() => _userManager.Object;
    }
}