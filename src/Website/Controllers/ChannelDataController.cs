using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Website.Services;
using Google.Apis.YouTube.v3.Data;
using System.IO;
using System.Xml;
using System.ServiceModel.Syndication;
using System.Xml.Linq;
using Microsoft.Extensions.Configuration;
using Website.Models.ChannelData;

namespace Website.Controllers
{
    [ApiController, Route("ChannelData")]
    public class ChannelDataController : Controller
    {
        private readonly IVideoRepository _videoRepository;
        private readonly IEmailService _email;
        private readonly IConfiguration _config;

        public ChannelDataController(IVideoRepository videoRepository, IEmailService email, IConfiguration config)
        {
            _videoRepository = videoRepository;
            _email = email;
            _config = config;
        }

        [HttpGet, HttpPost]
        public async Task<ActionResult> Index()
        {
            // subscription confirmation
            if (Request.Query.TryGetValue("hub.challenge", out StringValues challenge))
            {
                await _email.SendEmailAsync(_config["AdminEmail"],
                    "Youtube Push Notification Subscription",
                    "<body>" +
                    "<h1>The youtube push notification endpoint has been triggered.</h1>" +
                    $"<p>returning challenge with statuscode 200: <br/>{challenge.ToString()}</p>" +
                    "</body>");

                return new ContentResult()
                {
                    Content = challenge,
                    ContentType = Request.ContentType,
                    StatusCode = (int?)HttpStatusCode.OK
                };
            }

            // notification
            else
            {
                try 
                {
                    var notificationData = ConvertAtomToSyndication(Request.Body);
                    VideoListResponse? youtubeApiResult = null;

                    if (notificationData.VideoId != null)
                    {
                        youtubeApiResult = await _videoRepository.GetYoutubeVideoData(notificationData.VideoId);
                        var lowercasedVideoTitle = youtubeApiResult.Items[0].Snippet.Title.ToLower();

                        if (lowercasedVideoTitle.Contains("isaac"))
                        {
                            var videoExists = await _videoRepository.VideoExists(youtubeApiResult.Items[0].Id);

                            if (videoExists)
                            {
                                await _videoRepository.UpdateVideosWithYoutubeData(new List<Video>() { youtubeApiResult.Items[0] });
                            }
                            else
                            {
                                await _videoRepository.SaveVideo(youtubeApiResult.Items[0]);
                            }

                            await _videoRepository.SetThumbnails(youtubeApiResult.Items[0].Snippet.Thumbnails, notificationData.VideoId);

                            await _email.SendEmailAsync(_config["AdminEmail"],
                                "Youtube Push Notification Received - Isaac Episode",
                                "<body>" +
                                "<h1>A Push Notification was received!</h1>" +
                                $"<p><pre>{Newtonsoft.Json.JsonConvert.SerializeObject(notificationData, Newtonsoft.Json.Formatting.Indented)}</pre></p>" +
                                $"<p><pre>{Newtonsoft.Json.JsonConvert.SerializeObject(youtubeApiResult, Newtonsoft.Json.Formatting.Indented)}</pre></p>" +
                                "</body>");
                        }
                        else
                        {
                            await _email.SendEmailAsync(_config["AdminEmail"],
                                "Youtube Push Notification Received - Non-Isaac Video",
                                "<body>" +
                                "<h1>A Push Notification was received!</h1>" +
                                $"<p><pre>{Newtonsoft.Json.JsonConvert.SerializeObject(notificationData, Newtonsoft.Json.Formatting.Indented)}</pre></p>" +
                                $"<p><pre>{Newtonsoft.Json.JsonConvert.SerializeObject(youtubeApiResult, Newtonsoft.Json.Formatting.Indented)}</pre></p>" +
                                "</body>");
                        }
                    }
                }
                catch (Exception e)
                {
                    await _email.SendEmailAsync(_config["AdminEmail"],
                        "[Error] Youtube Push Notification Received",
                        "<body>" +
                        "<h1>A Push Notification was received but was not transmitted successfully!</h1>" +
                        $"<p>{e.Message}</p>" +
                        "</body>");
                }

                return Ok();
            }
        }
        
        private YoutubeNotification ConvertAtomToSyndication(Stream stream)
        {
            using var xmlReader = XmlReader.Create(stream);
            SyndicationFeed feed = SyndicationFeed.Load(xmlReader);
            var f = feed.Items.FirstOrDefault();
            return new YoutubeNotification()
            {
                ChannelId = GetElementExtensionValueByOuterName(f, "channelId"),
                VideoId = GetElementExtensionValueByOuterName(f, "videoId"),
                Title = f.Title.Text,
                Published = f.PublishDate.ToString("dd/MM/yyyy"),
                Updated = f.LastUpdatedTime.ToString("dd/MM/yyyy")
            };
        }

        private string? GetElementExtensionValueByOuterName(SyndicationItem item, string outerName)
        {
            if (item.ElementExtensions.All(x => x.OuterName != outerName)) return null;
            return item.ElementExtensions.Single(x => x.OuterName == outerName).GetObject<XElement>().Value;
        }
    }
}
