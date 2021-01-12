using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Website.Models;

namespace Website.Controllers
{
    public class HomeController : Controller
    {
        public const string Controllername = "Home";

        public IActionResult Index() => View();

        public ViewResult SilentSignin() => View();

        public OkResult Error() => Ok();
    }
}
