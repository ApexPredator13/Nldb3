﻿using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Website.Models;
using Website.Models.Database;
using Website.Services;

namespace Website.Areas.Api.Controllers
{
    [ApiController, Route("api/videos")]
    public class VideosController : Controller
    {
        private readonly IVideoRepository _videoRepository;

        public VideosController(IVideoRepository videoRepository)
        {
            _videoRepository = videoRepository;
        }

        [HttpGet]
        public async Task<NldbVideoResult> GetVideos([FromQuery] GetVideos? request = null)
        {
            if (request is null)
            {
                request = new GetVideos();
            }

            return await _videoRepository.GetVideos(request);
        }
    }
}