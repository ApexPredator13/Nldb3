using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityServer4;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Website.Infrastructure;
using Website.Models.Account;
using Website.Services;

namespace Website.Controllers
{
    public class AccountController : Controller
    {
        public const string Controllername = "Account";

        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IEmailService _emailSender;
        private readonly IIdentityServerInteractionService _identityServerInteractionService;
        private readonly IPersistedGrantService _persistedGrantService;
        private readonly IConfiguration _config;

        public AccountController(
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            IEmailService emailSender,
            IIdentityServerInteractionService iis,
            IPersistedGrantService persistedGrantService,
            IConfiguration config)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _emailSender = emailSender;
            _identityServerInteractionService = iis;
            _persistedGrantService = persistedGrantService;
            _config = config;
        }

        [HttpGet]
        public async Task<ActionResult> Login([FromQuery] string returnUrl)
        {
            // if user is logged in already, redirect him to his profile page
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction(nameof(MyAccountController.Index), MyAccountController.Controllername);
            }

            // get data for view
            ViewData["externalLogins"] = await _signInManager.GetExternalAuthenticationSchemesAsync();
            ViewData["returnUrl"] = returnUrl;

            // clear external cookie
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            await HttpContext.SignOutAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);

            return View(new LoginModel());
        }

        [HttpPost]
        public async Task<ActionResult> Login([FromForm] LoginModel model, [FromQuery] string returnUrl)
        {
            // local function to prepare view data
            async Task FillViewData()
            {
                ViewData["externalLogins"] = await _signInManager.GetExternalAuthenticationSchemesAsync();
                ViewData["returnUrl"] = returnUrl;
            }

            // check user input
            if (!ModelState.IsValid)
            {
                await FillViewData();
                return View(model);
            }

            // check returnUrl - if it's invalid just throw the user back to the main page to provide a clean start
            if (!_identityServerInteractionService.IsValidReturnUrl(returnUrl))
            {
                return LocalRedirect("/");
            }

            // find user
            IdentityUser? user = await _userManager.FindByEmailAsync(model.EmailOrUsername);

            if (user is null)
            {
                user = await _userManager.FindByNameAsync(model.EmailOrUsername);
            }

            // if user doesn't exist, redisplay view
            if (user is null)
            {
                await FillViewData();
                ModelState.AddModelError("", "Login failed, please try again.");
                return View(model);
            }

            // if he exists, attempty sign-in
            var result = await _signInManager.PasswordSignInAsync(user.UserName, model.Password, model.RememberMe, false);

            // success
            if (result.Succeeded)
            {
                return Redirect(returnUrl);
            }

            // too many failed login attempts
            if (result.IsLockedOut)
            {
                await FillViewData();
                ModelState.AddModelError("", "Login failed too many times, please wait a minute before trying again.");
                return View(model);
            }

            // something else went wrong...
            await FillViewData();
            ModelState.AddModelError("", "Login failed, please try again.");
            return View(model);
        }

        [HttpGet]
        public async Task<ActionResult> ConfirmEmail([FromQuery] string? userId, [FromQuery] string? code)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(code))
            {
                return RedirectToAction(nameof(ConfirmEmailFailed));
            }

            var user = await _userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return RedirectToAction(nameof(ConfirmEmailFailed));
            }

            var result = await _userManager.ConfirmEmailAsync(user, code);

            if (!result.Succeeded)
            {
                return RedirectToAction(nameof(ConfirmEmailFailed));
            }

            return View();
        }

        [HttpGet]
        public ViewResult ConfirmEmailFailed()
        {
            ViewData["returnUrl"] = Url.Action(nameof(MyAccountController.ConfirmEmailAgain), MyAccountController.Controllername);
            return View();
        }

        [HttpGet]
        public ChallengeResult ExternalLogin([FromQuery] string provider, [FromQuery] string returnUrl)
        {
            var redirectUrl = Url.Action(nameof(ExternalLoginCallback), new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return new ChallengeResult(provider, properties);
        }

        [HttpGet]
        public ViewResult Logout() => View();

        [HttpPost]
        public async Task<RedirectToActionResult> Logout([FromQuery] string? returnUrl = null)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user != null)
            {
                var clients = IdentityserverResources.Clients(_config);
                foreach (var client in clients)
                {
                    await _persistedGrantService.RemoveAllGrantsAsync(user.Id, client.ClientId);
                }
            }

            await HttpContext.SignOutAsync();
            return RedirectToAction(nameof(HomeController.Index), HomeController.Controllername);
        }

        private string GetExternalLoginUsername(ExternalLoginInfo info)
        {
            switch (info.LoginProvider.ToLower())
            {
                case "twitch":
                    var twitchDisplayName = info.Principal.Claims.FirstOrDefault(x => x.Type.ToLower() == "urn:twitch:displayname");
                    if (twitchDisplayName != null)
                    {
                        return twitchDisplayName.Value;
                    }
                    break;
                case "steam":
                    var steamName = info.Principal.Claims.FirstOrDefault(x => x.Type.ToLower() == ClaimTypes.Name);
                    if (steamName != null)
                    {
                        return steamName.Value;
                    }
                    break;
                case "twitter":
                    var twitterScreenName = info.Principal.Claims.FirstOrDefault(x => x.Type.ToLower() == "urn:twitter:screenname");
                    if (twitterScreenName != null)
                    {
                        return twitterScreenName.Value;
                    }
                    break;
            }

            return string.Empty;
        }

        [HttpGet]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl, string? remoteError = null)
        {
            // show error page if something went wrong or is missing
            if (remoteError != null || !_identityServerInteractionService.IsValidReturnUrl(returnUrl))
            {
                return RedirectToAction(nameof(ExternalLoginFailed));
            }

            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info is null)
            {
                return RedirectToAction(nameof(ExternalLoginFailed));
            }

            // get username from claims, pre-fill the username field on the next page
            string existingUsername = GetExternalLoginUsername(info);
            ViewData["ExistingUsername"] = existingUsername;

            // sign user in
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, false, true);


            // user was here before
            if (result.Succeeded)
            {
                // clear external cookie and redirect
                await HttpContext.SignOutAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);
                return Redirect(returnUrl);
            }

            // user was here before, but login failed too many times
            else if (result.IsLockedOut)
            {
                // clear external cookie and redirect to error page
                await HttpContext.SignOutAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);
                return RedirectToAction(nameof(ExternalLoginFailed), new { error = "Login failed too many times, please wait a minute before trying again." });
            }

            // user was never here before, ask him to choose a username - don't clear external cookie in this case!
            else
            {
                ViewData["returnUrl"] = returnUrl;
                return View(new ExternalLoginCallbackModel(info.LoginProvider));
            }
        }

        [HttpPost]
        public async Task<ActionResult> ExternalLoginCallback([FromForm] ExternalLoginCallbackModel model, [FromQuery] string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                ViewData["returnUrl"] = returnUrl;
                return View(model);
            }

            if (!_identityServerInteractionService.IsValidReturnUrl(returnUrl))
            {
                return RedirectToAction(nameof(ExternalLoginFailed));
            }

            var info = await _signInManager.GetExternalLoginInfoAsync();

            if (info is null)
            {
                return RedirectToAction(nameof(ExternalLoginFailed));
            }

            var newUser = new IdentityUser(model.UserName);

            var result = await _userManager.CreateAsync(newUser);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                ViewData["returnUrl"] = returnUrl;
                return View(model);
            }

            result = await _userManager.AddLoginAsync(newUser, info);

            // if login cannot be added, remove user profile and redisplay form to start over in a clean way
            if (!result.Succeeded)
            {
                try
                {
                    await _userManager.DeleteAsync(newUser);
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                }
                catch { }
                finally
                {
                    ViewData["returnUrl"] = returnUrl;
                }
                return View(model);
            }

            // sign user in and clear external cookie.
            await _signInManager.SignInAsync(newUser, false);
            await HttpContext.SignOutAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);

            return Redirect(returnUrl);
        }

        [HttpGet]
        public ViewResult ExternalLoginFailed([FromQuery] string? error) => View(nameof(ExternalLoginFailed), error);

        [HttpGet]
        public ViewResult ForgotPassword() => View();

        [HttpPost]
        public async Task<ActionResult> ForgotPassword([FromForm] ForgotPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user is null)
            {
                return RedirectToAction(nameof(ForgotPasswordEmailSent));
            }

            bool userHasConfirmedEmail = await _userManager.IsEmailConfirmedAsync(user);

            if (!userHasConfirmedEmail)
            {
                return RedirectToAction(nameof(ForgotPasswordEmailSent));
            }

            var code = await _userManager.GeneratePasswordResetTokenAsync(user);
            var callbackUrl = Url.Action(nameof(ResetPassword), Controllername, new { code }, Request.Scheme);

            var emailMessage = _emailSender.GenerateResetPasswordEmail(model.Email ?? string.Empty, callbackUrl);
            await _emailSender.SendEmailAsync(model.Email ?? string.Empty, "The Northernlion Database - Password Reset", emailMessage);

            return RedirectToAction(nameof(ForgotPasswordEmailSent));
        }

        [HttpGet]
        public ViewResult ForgotPasswordEmailSent() => View();

        [HttpGet]
        public ActionResult ResetPassword([FromQuery] string? code = null)
        {
            if (string.IsNullOrEmpty(code))
            {
                return RedirectToAction(nameof(PasswordResetFailed));
            }

            return View(new ResetPasswordModel { Code = code });
        }

        [HttpPost]
        public async Task<ActionResult> ResetPassword(ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = await _userManager.FindByEmailAsync(model.EmailOrUsername);

            if (user is null)
            {
                user = await _userManager.FindByNameAsync(model.EmailOrUsername);
            }
            if (user is null)
            {
                return RedirectToAction(nameof(PasswordResetFailed));
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Code, model.Password);

            if (!result.Succeeded)
            {
                return RedirectToAction(nameof(PasswordResetFailed));
            }

            return RedirectToAction(nameof(PasswordResetSucceeded));
        }

        [HttpGet]
        public ViewResult PasswordResetFailed() => View();

        [HttpGet]
        public ViewResult PasswordResetSucceeded() => View();

        [HttpGet]
        public ViewResult Register([FromQuery] string returnUrl)
        {
            ViewData["returnUrl"] = returnUrl;
            return View(new RegisterModel());
        }

        [HttpPost]
        public async Task<ActionResult> Register([FromForm] RegisterModel model, [FromQuery] string returnUrl)
        {
            // check user input and returnUrl
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            if (!_identityServerInteractionService.IsValidReturnUrl(returnUrl))
            {
                return RedirectToAction(nameof(HomeController.Index), HomeController.Controllername);
            }

            // create the new user
            var user = new IdentityUser(model.Username)
            {
                Email = model.Email
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            // if something went wrong, redisplay register form
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                return View(model);
            }

            // otherwise send email confirmation link
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var userId = user.Id;
            var callbackUrl = Url.Action(nameof(ConfirmEmail), Controllername, new { code, userId }, Request.Scheme);
            var emailMessage = _emailSender.GenerateConfirmEmailAddressEmail(model.Email, callbackUrl);
            await _emailSender.SendEmailAsync(model.Email, "The Northernlion Database - Your new account", emailMessage);

            // ...and log the user in right away
            await _signInManager.SignInAsync(user, false);
            return Redirect(returnUrl);
        }

        [HttpGet]
        public ViewResult AccessDenied() => View();
    }
}
