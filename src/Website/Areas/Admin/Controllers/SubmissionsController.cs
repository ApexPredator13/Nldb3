using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Services;

namespace Website.Areas.Admin.Controllers
{
    public class SubmissionsController : Controller
    {
        public const string Controllername = "Submissions";

        private readonly IIsaacRepository _isaacRepository;

        public SubmissionsController(IIsaacRepository isaacRepository)
        {
            _isaacRepository = isaacRepository;
        }

        public ViewResult Index() => View();
    }
}
