using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Website.Controllers
{
    public class MyAccountController : Controller
    {
        public const string Controllername = "MyAccount";

        public ViewResult Index()
        {
            return View();
        }
    }
}
