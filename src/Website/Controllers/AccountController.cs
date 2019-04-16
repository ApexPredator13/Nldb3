using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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

        public AccountController(SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager, IEmailService emailSender)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _emailSender = emailSender;
        }

        [HttpGet]
        public IActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction(nameof(MyAccountController.Index), MyAccountController.Controllername);
            }
            else
            {
                return RedirectToAction(nameof(Login));
            }
        }

        [HttpGet]
        public async Task<ActionResult> Login([FromQuery] string? returnUrl = null)
        {
            ViewData["externalLogins"] = await _signInManager.GetExternalAuthenticationSchemesAsync();
            ViewData["returnUrl"] = returnUrl;
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction(nameof(MyAccountController.Index), MyAccountController.Controllername);
            }
            else
            {
                return View(new LoginModel());
            }
        }

        [HttpPost]
        public async Task<ActionResult> Login([FromForm] LoginModel model, [FromQuery] string? returnUrl = null)
        {
            async Task FillViewData()
            {
                ViewData["externalLogins"] = await _signInManager.GetExternalAuthenticationSchemesAsync();
                ViewData["returnUrl"] = returnUrl;
            }

            if (!ModelState.IsValid)
            {
                await FillViewData();
                return View(model);
            }

            IdentityUser? user = await _userManager.FindByEmailAsync(model.EmailOrUsername);

            if (user is null)
            {
                user = await _userManager.FindByNameAsync(model.EmailOrUsername);
            }
            if (user is null)
            {
                await FillViewData();
                ModelState.AddModelError("", "Login failed, please try again.");
                return View(model);
            }

            var result = await _signInManager.PasswordSignInAsync(model.EmailOrUsername, model.Password, model.RememberMe, true);

            if (result.Succeeded)
            {
                return LocalRedirect(returnUrl ?? Url.Action(nameof(HomeController.Index), HomeController.Controllername));
            }
            if (result.IsLockedOut)
            {
                await FillViewData();
                ModelState.AddModelError("", "Login failed too many times, please wait a minute before trying again.");
                return View(model);
            }

            await FillViewData();
            ModelState.AddModelError("", "Login failed, please try again.");
            return View(model);
        }

        [HttpGet]
        public ViewResult ConfirmEmailFailed() => View();

        [HttpGet]
        public async Task<ActionResult> ConfirmEmail([FromQuery] string? userId, [FromQuery] string? code)
        {
            if (String.IsNullOrEmpty(userId) || String.IsNullOrEmpty(code))
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
        public ChallengeResult ExternalLogin([FromQuery] string provider, [FromQuery] string? returnUrl = null)
        {
            if (String.IsNullOrEmpty(returnUrl))
            {
                returnUrl = Url.Action(nameof(HomeController.Index), HomeController.Controllername);
            }
            
            var redirectUrl = Url.Action(nameof(ExternalLoginCallback), new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return new ChallengeResult(provider, properties);
        }

        [HttpGet]
        public ViewResult Logout([FromQuery] string? returnUrl = null) 
            => View(nameof(Logout), returnUrl);

        [HttpPost]
        public async Task<LocalRedirectResult> Logout([FromForm] LogoutModel model)
        {
            model.ReturnUrl ??= Url.Action(nameof(HomeController.Index), HomeController.Controllername);
            await _signInManager.SignOutAsync();
            return LocalRedirect(model.ReturnUrl);
        }

        [HttpGet]
        public async Task<ActionResult> ExternalLoginCallback(string? returnUrl = null, string? remoteError = null)
        {
            if (remoteError != null)
            {
                return RedirectToAction(nameof(ExternalLoginFailed));
            }

            if (String.IsNullOrEmpty(returnUrl))
            {
                returnUrl = Url.Action(nameof(HomeController.Index), HomeController.Controllername);
            }

            var info = await _signInManager.GetExternalLoginInfoAsync();

            if (info is null)
            {
                return RedirectToAction(nameof(ExternalLoginFailed));
            }

            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, false, true);

            // user was here before
            if (result.Succeeded)
            {
                return LocalRedirect(returnUrl);
            }

            // user was here before, but login failed too many times
            else if (result.IsLockedOut)
            {
                return RedirectToAction(nameof(ExternalLoginFailed), new { error = "Login failed too many times, please wait a minute before trying again." });
            }

            // user was never here before, ask him to choose a username
            else
            {
                ViewData["returnUrl"] = returnUrl;
                return View(new ExternalLoginCallbackModel(info.LoginProvider));
            }
        }

        [HttpPost]
        public async Task<ActionResult> ExternalLoginCallback([FromForm] ExternalLoginCallbackModel model, [FromQuery] string? returnUrl = null)
        {
            if (!ModelState.IsValid)
            {
                ViewData["returnUrl"] = returnUrl;
                return View(model);
            }

            if (string.IsNullOrEmpty(returnUrl))
            {
                returnUrl = Url.Action(nameof(HomeController.Index), HomeController.Controllername);
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
                    ModelState.AddModelError(String.Empty, error.Description);
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
                        ModelState.AddModelError(String.Empty, error.Description);
                    }
                }
                catch { }
                finally
                {
                    ViewData["returnUrl"] = returnUrl;
                }
                return View(model);
            }

            await _signInManager.SignInAsync(newUser, false);

            return LocalRedirect(returnUrl);
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
            var callbackUrl = Url.Action(nameof(ForgotPassword), new { code });

            var email = _emailSender.GenerateResetPasswordEmail(model.Email ?? string.Empty, callbackUrl);
            await _emailSender.SendEmailAsync(email, "The Northernlion Database - Password Reset", email);

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
        public ViewResult Register() => View(new RegisterModel());

        [HttpPost]
        public async Task<ActionResult> Register([FromForm] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = new IdentityUser(model.Username)
            {
                Email = model.Email
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                return View(model);
            }

            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var userId = user.Id;
            var callbackUrl = Url.Action(nameof(ConfirmEmail), new { code, userId });
            var emailMessage = _emailSender.GenerateConfirmEmailAddressEmail(model.Email, callbackUrl);
            await _emailSender.SendEmailAsync(model.Email, "The Northernlion Database - Your new account", emailMessage);

            await _signInManager.SignInAsync(user, false);
            return RedirectToAction(nameof(MyAccountController.RegistrationComplete), MyAccountController.Controllername);
        }
    }
}
