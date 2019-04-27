using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Services;

namespace Website.Areas.Admin.Controllers
{
    [Authorize("admin"), Area("Admin")]
    public class HomeController : Controller
    {
        private readonly IIsaacRepository _isaacRepository;

        public HomeController(IIsaacRepository isaacRepository)
        {
            _isaacRepository = isaacRepository;
        }

        public ViewResult Index() => View();
    }
}
