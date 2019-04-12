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

        public ViewResult SetPassword() => View();

        public ViewResult RegistrationComplete() => View();
    }
}
