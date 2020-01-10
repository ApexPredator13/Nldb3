using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Website.Controllers
{
    public class SqlDumpController : Controller
    {
        public const string Controllername = "SqlDump";

        public ViewResult Description() => View();
        public ViewResult Tables() => View();
        public ViewResult Details() => View();
        public ViewResult Tags() => View();
    }
}
