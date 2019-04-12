using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
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

        public ViewResult Index(MyAccountMessage? message = null)
        {
            return View(nameof(Index), message);
        }

        [HttpGet]
        public async Task<ActionResult> ChangePassword()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername);
            }

            var hasPassword = await _userManager.HasPasswordAsync(user);

            if (!hasPassword)
            {
                return RedirectToAction(nameof(SetPassword));
            }

            return View(new ChangePasswordModel());
        }

        [HttpPost]
        public async Task<ActionResult> ChangePassword(ChangePasswordModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername);
            }

            var hasPassword = await _userManager.HasPasswordAsync(user);

            if (!hasPassword)
            {
                return RedirectToAction(nameof(SetPassword));
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
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername);
            }

            bool userHasPassword = await _userManager.HasPasswordAsync(user);

            return View(userHasPassword);
        }

        [HttpPost]
        public async Task<ActionResult> DeleteAccount([FromForm] DeleteAccountInputModel model)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            {
                return RedirectToAction(nameof(AccountController.Login), AccountController.Controllername);
            }

            var userHasPassword = await _userManager.HasPasswordAsync(user);

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

        public ViewResult SetPassword() => View();

        public ViewResult RegistrationComplete() => View();
    }
}
