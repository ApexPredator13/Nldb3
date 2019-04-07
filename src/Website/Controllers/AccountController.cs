using System;
using System.Linq;
using System.Security.Claims;
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
        public ViewResult Logout()
        {
            throw new NotImplementedException();
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
            returnUrl ??= Url.Action(nameof(HomeController.Index), HomeController.Controllername);

            if (!ModelState.IsValid)
            {
                ViewData["returnUrl"] = returnUrl;
                return View(model);
            }

            var info = await _signInManager.GetExternalLoginInfoAsync();

            if (info is null)
            {
                return RedirectToAction(nameof(ExternalLoginFailed));
            }

            var newUser = new IdentityUser
            {
                UserName = model.UserName
            };

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


        public ViewResult ExternalLoginFailed([FromQuery] string? error) => View(nameof(ExternalLoginFailed), error);
    }
}
