using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Services;

namespace Website.Controllers
{
    public class QuotesController : Controller
    {
        private readonly IQuoteRepository _quotesRepository;

        public QuotesController(IQuoteRepository quoteRepository)
        {
            _quotesRepository = quoteRepository;
        }

        [HttpGet]
        public ViewResult Index() => View();
    }
}
