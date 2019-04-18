using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Website.Models.MyAccount;
using Website.Services;

namespace Website.Controllers
{
    [Authorize]
    public class MyAccountController : Controller
    {
        public const string Controllername = "MyAccount";

        private readonly UserManager<IdentityUser> _userManager;
        private readonly IEmailService _emailService;
        private readonly SignInManager<IdentityUser> _signInManager;

        public MyAccountController(UserManager<IdentityUser> userManager, IEmailService emailService, SignInManager<IdentityUser> signInManager)
        {
            _userManager = userManager;
            _emailService = emailService;
            _signInManager = signInManager;
        }

        public async Task<ActionResult> Index(string? message = null)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(Index));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var model = new IndexModel
            {
                EmailIsConfirmed = await _userManager.IsEmailConfirmedAsync(user),
                HasEmail = user.Email != null,
                HasPassword = await _userManager.HasPasswordAsync(user),
                User = user
            };

            ViewData["Message"] = message;

            return View(model);
        }

        [HttpGet]
        public async Task<ActionResult> ChangePassword()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangePassword));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var hasPassword = await _userManager.HasPasswordAsync(user);

            if (!hasPassword)
            {
                return RedirectToAction(nameof(AddNormalLogin));
            }

            return View(new ChangePasswordModel());
        }

        [HttpPost]
        public async Task<ActionResult> ChangePassword([FromForm] ChangePasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangePassword));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var hasPassword = await _userManager.HasPasswordAsync(user);

            if (!hasPassword)
            {
                return RedirectToAction(nameof(AddNormalLogin));
            }

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                return View(model);
            }

            await _signInManager.RefreshSignInAsync(user);
            return RedirectToAction(nameof(Index), new { message = MyAccountMessage.YourPasswordWasChanged });
        }

        [HttpGet]
        public async Task<ActionResult> DeleteAccount()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(DeleteAccount));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            ViewData["UserHasPassword"] = await _userManager.HasPasswordAsync(user);

            return View(new DeleteAccountInputModel());
        }

        [HttpPost]
        public async Task<ActionResult> DeleteAccount([FromForm] DeleteAccountInputModel model)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(DeleteAccount));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var userHasPassword = await _userManager.HasPasswordAsync(user);
            ViewData["UserHasPassword"] = userHasPassword;

            // manual validation
            if (userHasPassword && string.IsNullOrEmpty(model.Password))
            {
                ModelState.AddModelError(string.Empty, "Please enter your password!");
                return View(model);
            }
            else if (!userHasPassword && string.IsNullOrEmpty(model.UserNameOrEmail))
            {
                ModelState.AddModelError(string.Empty, "Please enter your username or email!");
                return View(model);
            }
            
            // check password if necessary
            if (userHasPassword && !await _userManager.CheckPasswordAsync(user, model.Password))
            {
                ModelState.AddModelError(string.Empty, "The password you entered was incorrect");
                return View(model);
            }

            // check username/email if necessary
            if (!userHasPassword)
            {
                if (model.UserNameOrEmail is null)
                {
                    model.UserNameOrEmail = string.Empty;
                }

                string userEmail = user.Email?.ToLower() ?? string.Empty;
                string username = user.UserName ?? string.Empty;

                if (userEmail != model.UserNameOrEmail && username != model.UserNameOrEmail)
                {
                    ModelState.AddModelError(string.Empty, "please enter your correct username or email address");
                    return View(model);
                }
            }

            // delete account
            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                ModelState.AddModelError(string.Empty, "An unexpected error occurred while deleting the account, please try again!");
                return View(model);
            }

            await _signInManager.SignOutAsync();
            return RedirectToAction(nameof(AccountWasDeleted));
        }

        [AllowAnonymous]
        public ViewResult AccountWasDeleted() => View();

        [HttpPost]
        public async Task<ActionResult> DownloadMyData()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(Index));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var personalData = new Dictionary<string, string>();
            var personalDataProperties = typeof(IdentityUser).GetProperties().Where(x => Attribute.IsDefined(x, typeof(PersonalDataAttribute)));

            foreach (var p in personalDataProperties)
            {
                personalData.Add(p.Name, p.GetValue(user)?.ToString() ?? "");
            }

            Response.Headers.Add("Content-Disposition", "attachment; filename=PersonalData.txt");
            return new FileContentResult(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(personalData)), "text/plain");
        }

        private async Task FillViewDataForExternalLoginPage(IdentityUser user, ViewDataDictionary viewData)
        {
            var currentLogins = await _userManager.GetLoginsAsync(user);
            var otherLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).Where(scheme => currentLogins.All(login => scheme.Name != login.LoginProvider)).ToList();
            var showRemoveButton = user.PasswordHash != null || currentLogins.Count > 1;

            viewData["CurrentLogins"] = currentLogins;
            viewData["OtherLogins"] = otherLogins;
            viewData["ShowRemoveButton"] = showRemoveButton;
        }

        [HttpGet]
        public async Task<ActionResult> ExternalLogins()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ExternalLogins));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            await FillViewDataForExternalLoginPage(user, ViewData);

            return View();
        }

        [HttpPost]
        public async Task<ActionResult> RemoveExternalLogin([FromForm] RemoveLoginModel model)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ExternalLogins));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            if (!ModelState.IsValid)
            {
                await FillViewDataForExternalLoginPage(user, ViewData);
                return View(nameof(ExternalLogins));
            }

            var result = await _userManager.RemoveLoginAsync(user, model.LoginProvider, model.ProviderKey);

            if (!result.Succeeded)
            {
                ModelState.AddModelError(string.Empty, "The external login could not be removed");
                await FillViewDataForExternalLoginPage(user, ViewData);
                return View(nameof(ExternalLogins));
            }

            await _signInManager.RefreshSignInAsync(user);
            return RedirectToAction(nameof(ExternalLogins));
        }

        [HttpGet]
        public async Task<ChallengeResult> LinkLogin([FromQuery] string provider)
        {
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            var redirectUrl = Url.Action(nameof(LinkLoginCallback), Controllername);
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl, _userManager.GetUserId(User));
            return new ChallengeResult(provider, properties);
        }

        [HttpGet]
        public async Task<RedirectToActionResult> LinkLoginCallback()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ExternalLogins));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var info = await _signInManager.GetExternalLoginInfoAsync(await _userManager.GetUserIdAsync(user));

            if (info is null)
            {
                return RedirectToAction(nameof(Index), new { message = "An error occurred during external login, please try again." });
            }

            var result = await _userManager.AddLoginAsync(user, info);

            if (!result.Succeeded)
            {
                return RedirectToAction(nameof(Index), new { message = "An error occurred during external login, please try again." });
            }

            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            return RedirectToAction(nameof(ExternalLogins));
        }

        [HttpGet]
        public async Task<ActionResult> AddNormalLogin()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(AddNormalLogin));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var hasPassword = await _userManager.HasPasswordAsync(user);

            if (hasPassword)
            {
                return RedirectToAction(nameof(ChangePassword));
            }

            return View(new AddNormalLoginModel());
        }

        [HttpPost]
        public async Task<ActionResult> AddNormalLogin([FromForm] AddNormalLoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(AddNormalLogin));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var hasPassword = await _userManager.HasPasswordAsync(user);
            if (hasPassword)
            {
                return RedirectToAction(nameof(ChangePassword));
            }

                var result = await _userManager.SetEmailAsync(user, model.Email);
            if (!result.Succeeded)
            {
                ModelState.AddModelError(string.Empty, "An error occurred while adding the login data to your profile. Please try again.");
                return View(model);
            }

            result = await _userManager.AddPasswordAsync(user, model.Password);
            if (!result.Succeeded)
            {
                ModelState.AddModelError(string.Empty, "An error occurred while adding the login data to your profile. Please try again.");
                return View(model);
            }

            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var userId = user.Id;
            var callbackUrl = Url.Action(nameof(AccountController.ConfirmEmail), AccountController.Controllername, new { userId, code });
            var emailMessage = _emailService.GenerateConfirmEmailAddressEmail(model.Email, callbackUrl);
            await _emailService.SendEmailAsync(model.Email, "The Northernlion Database - e-mail confirmation", emailMessage);

            return RedirectToAction(nameof(NormalLoginAdded));
        }

        public ViewResult NormalLoginAdded() => View();

        [HttpGet]
        public async Task<ActionResult> ChangeEmail()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangeEmail));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            if (user.Email is null)
            {
                return RedirectToAction(nameof(AddNormalLogin));
            }

            return View(new ChangeEmailModel());
        }

        [HttpPost]
        public async Task<ActionResult> ChangeEmail(ChangeEmailModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangeEmail));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            if (user.Email is null)
            {
                return RedirectToAction(nameof(AddNormalLogin));
            }

            var code = await _userManager.GenerateChangeEmailTokenAsync(user, model.Email);
            var newEmail = model.Email;
            var callbackUrl = Url.Action(nameof(ChangeEmailConfirmation), new { code, newEmail });
            var emailMessage = _emailService.GenerateChangeEmailAddressEmail(newEmail, callbackUrl);
            await _emailService.SendEmailAsync(newEmail, "The Northernlion Database - Email Change", emailMessage);

            return RedirectToAction(nameof(ChangeEmailRequestSent));
        }

        public ViewResult ChangeEmailRequestSent() => View();

        [HttpGet]
        public async Task<RedirectToActionResult> ChangeEmailConfirmation([FromQuery] string? newEmail, [FromQuery] string? token)
        {
            if (string.IsNullOrEmpty(newEmail) || string.IsNullOrEmpty(token))
            {
                return RedirectToAction(nameof(EmailChangeFailed));
            }

            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangeEmailConfirmation), new { newEmail, token });
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var result = await _userManager.ChangeEmailAsync(user, newEmail, token);
            if (!result.Succeeded)
            {
                return RedirectToAction(nameof(EmailChangeFailed));
            }

            return RedirectToAction(nameof(Index), new { message = $"Your e-mail address has been changed to '{newEmail}'." });
        }

        public ViewResult EmailChangeFailed() => View();

        [HttpGet]
        public async Task<ActionResult> ChangeUsername()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangeUsername));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            ViewData["CurrentUsername"] = user.UserName;

            return View(new ChangeUsernameModel());
        }

        [HttpPost]
        public async Task<ActionResult> ChangeUsername(ChangeUsernameModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangeUsername));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            var result = await _userManager.SetUserNameAsync(user, model.NewUsername);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                return View(model);
            }

            return RedirectToAction(nameof(Index), new { message = $"Your username has been changed to {model.NewUsername}" });
        }

        public ViewResult RegistrationComplete() => View();

        [HttpGet]
        public async Task<ActionResult> ConfirmEmailAgain()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ChangeUsername));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            if (user.Email is null)
            {
                return RedirectToAction(nameof(Index), new { message = "You have to add an e-mail address to your account before you can confirm it." });
            }
            if (await _userManager.IsEmailConfirmedAsync(user))
            {
                return RedirectToAction(nameof(Index), new { message = "Your e-mail address is already confirmed" });
            }

            return View();
        }

        [HttpPost]
        public async Task<ActionResult> ConfirmEmailAgainLinkSent()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
            {
                var returnUrl = Url.Action(nameof(ConfirmEmailAgain));
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername, new { returnUrl });
            }

            if (user.Email is null)
            {
                return RedirectToAction(nameof(Index), new { message = "You have to add an e-mail address to your account before you can confirm it." });
            }
            if (await _userManager.IsEmailConfirmedAsync(user))
            {
                return RedirectToAction(nameof(Index), new { message = "Your e-mail address is already confirmed" });
            }

            var userId = user.Id;
            var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var callbackUrl = Url.Action(nameof(AccountController.ConfirmEmail), AccountController.Controllername, new { userId, code });
            var email = _emailService.GenerateConfirmEmailAddressEmail(user.Email, callbackUrl);
            await _emailService.SendEmailAsync(user.Email, "The Northernlion Database - e-mail confirmation", email);

            return View();
        }
    }
}
