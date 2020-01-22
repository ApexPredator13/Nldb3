using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System.IO;

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
            if (Infrastructure.SqlDumper.currentlyRecreatingDump) {
                return BadRequest("The SQL Dump is currently being recreated. Please wait a few seconds and try again.");
            }

            var sqlDumpPath = Path.Combine(_env.WebRootPath, "dump", "nldb_dump.sql");
            return PhysicalFile(sqlDumpPath, "APPLICATION/octet-stream", "NorthernlionDatabase_SQL_Dump.sql");
        }
    }
}


