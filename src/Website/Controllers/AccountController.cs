using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Website.Models.Account;

namespace Website.Controllers
{
    public class AccountController : Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;

        public AccountController(SignInManager<IdentityUser> signInManager, UserManager<IdentityUser> userManager)
        {
            _signInManager = signInManager;
            _userManager = userManager;
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
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            IdentityUser? user = await _userManager.FindByEmailAsync(model.EmailOrUsername);

            if (user is null)
            {
                user = await _userManager.FindByNameAsync(model.EmailOrUsername);
            }
            if (user is null)
            {
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
                ModelState.AddModelError("", "Login failed too many times, please wait a minute before trying again.");
                return View(model);
            }

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

        public ViewResult Logout()
        {
            throw new NotImplementedException();
        }
    }
}
