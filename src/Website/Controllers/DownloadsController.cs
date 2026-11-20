using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Website.Infrastructure;

namespace Website.Controllers
{
    [ApiController, Route("Api/Downloads")]
    public class DownloadsController : Controller
    {
        public const string Controllername = "Downloads";

        private readonly IWebHostEnvironment _env;

        public DownloadsController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpGet]
        public ActionResult DownloadFile()
        {
            var sqlDumpPath = SqlDumper.GetDumpFilePath(_env);
            if (!System.IO.File.Exists(sqlDumpPath))
            {
                return NotFound("The SQL dump has not been generated yet. Please try again shortly.");
            }

            return PhysicalFile(sqlDumpPath, "application/octet-stream", "NorthernlionDatabase_SQL_Dump.sql");
        }
    }
}
