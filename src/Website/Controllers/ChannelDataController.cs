using Microsoft.AspNetCore.Http;
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
using Microsoft.Extensions.Logging;
using Website.Models.ChannelData;

namespace Website.Controllers
{
    [ApiController, Route("ChannelData")]
    public class ChannelDataController : Controller
    {
        private readonly IVideoRepository _videoRepository;
        private readonly IEmailService _email;
        private readonly IConfiguration _config;
        private readonly ILogger<ChannelDataController> _logger;

        public ChannelDataController(
            IVideoRepository videoRepository,
            IEmailService email,
            IConfiguration config,
            ILogger<ChannelDataController> logger)
        {
            _videoRepository = videoRepository;
            _email = email;
            _config = config;
            _logger = logger;
        }

        [HttpGet, HttpPost, IgnoreAntiforgeryToken]
        public async Task<ActionResult> Index()
        {
            var expectedChannelId = _config["NorthernlionChannelId"];

            if (string.IsNullOrWhiteSpace(expectedChannelId))
            {
                _logger.LogError("channel ID is missing from configuration - ChannelDataController non-functional.");
            }

            // subscription confirmation ( = if YouTube sends a GET request)
            if (HttpMethods.IsGet(Request.Method) && Request.Query.TryGetValue("hub.challenge", out StringValues challenge))
            {
                var expectedTopic = $"https://www.youtube.com/xml/feeds/videos.xml?channel_id={expectedChannelId}";
                var topicWasFound = Request.Query.TryGetValue("hub.topic", out StringValues topic);
                var topicMatches = string.Equals(topic.ToString(), expectedTopic, StringComparison.OrdinalIgnoreCase);

                if (!topicWasFound)
                {
                    _logger.LogWarning($"Rejected YouTube push subscription. Expected topic {topic.ToString()} was not found");
                    return BadRequest();
                }

                if (!topicMatches)
                {
                    _logger.LogWarning($"Rejected YouTube push subscription. Expected topic {expectedTopic} does not match with {topic}");
                    return BadRequest();
                }

                _logger.LogInformation($"Confirmed YouTube push notification subscription for channel {expectedChannelId}.");

                return new ContentResult()
                {
                    Content = challenge.ToString(),
                    ContentType = "text/plain; charset=utf-8",
                    StatusCode = (int)HttpStatusCode.OK
                };
            }


            // only accept GET and POST
            if (!HttpMethods.IsPost(Request.Method))
            {
                return BadRequest();
            }

            // notification
            try
            {
                var notificationData = ConvertAtomToSyndication(Request.Body);

                if (notificationData is null || string.IsNullOrWhiteSpace(notificationData.VideoId))
                {
                    return Ok();
                }

                var channelIdOk = string.Equals(notificationData.ChannelId, expectedChannelId, StringComparison.Ordinal);

                if (!channelIdOk)
                {
                    _logger.LogWarning("Ignored YouTube push notification for unexpected channel {ChannelId}.", notificationData.ChannelId);
                    return Ok();
                }

                // load video data from YT API
                var youtubeApiResult = await _videoRepository.GetYoutubeVideoData(notificationData.VideoId);
                var video = youtubeApiResult?.Items?.FirstOrDefault();

                if (video is null)
                {
                    return Ok();
                }

                // check if the channel ID from the API result still matches
                var youtubeApiChannelIdOk = string.Equals(video.Snippet?.ChannelId, expectedChannelId, StringComparison.Ordinal);

                if (!string.Equals(video.Snippet?.ChannelId, expectedChannelId, StringComparison.Ordinal))
                {
                    _logger.LogWarning($"Wrong channel ID from Youtube API for the video {video.Id}. Expected {expectedChannelId} but got {video.Snippet?.ChannelId}.");
                    return Ok();
                }

                // check if it's an isaac episode
                var lowercasedVideoTitle = (video.Snippet?.Title ?? string.Empty).ToLowerInvariant();

                if (lowercasedVideoTitle.Contains("isaac") || lowercasedVideoTitle.Contains("repentance"))
                {
                    var videoExists = await _videoRepository.VideoExists(video.Id);

                    if (videoExists)
                    {
                        await _videoRepository.UpdateVideosWithYoutubeData([video]);
                    }
                    else
                    {
                        await _videoRepository.SaveVideo(video);
                    }

                    if (video.Snippet?.Thumbnails is not null)
                    {
                        await _videoRepository.SetThumbnails(video.Snippet.Thumbnails, notificationData.VideoId);
                    }

                    var adminEmail = _config["AdminEmail"];
                    if (!string.IsNullOrWhiteSpace(adminEmail))
                    {
                        var encodedNotification = WebUtility.HtmlEncode(
                            Newtonsoft.Json.JsonConvert.SerializeObject(notificationData, Newtonsoft.Json.Formatting.Indented));
                        var encodedTitle = WebUtility.HtmlEncode(video.Snippet?.Title ?? string.Empty);

                        await _email.SendEmailAsync(adminEmail,
                            "Youtube Push Notification Received - Isaac Episode",
                            "<body>" +
                            "<h1>A Push Notification was received!</h1>" +
                            $"<p>{encodedTitle}</p>" +
                            $"<p><pre>{encodedNotification}</pre></p>" +
                            "</body>");
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Failed to process YouTube push notification.");
            }

            return Ok();
        }

        private static YoutubeNotification? ConvertAtomToSyndication(Stream stream)
        {
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit,
                XmlResolver = null
            };

            using var xmlReader = XmlReader.Create(stream, settings);
            SyndicationFeed feed = SyndicationFeed.Load(xmlReader);
            var f = feed.Items.FirstOrDefault();

            if (f is null)
            {
                return null;
            }

            return new YoutubeNotification()
            {
                ChannelId = GetElementExtensionValueByOuterName(f, "channelId"),
                VideoId = GetElementExtensionValueByOuterName(f, "videoId"),
                Title = f.Title?.Text ?? string.Empty,
                Published = f.PublishDate.ToString("dd/MM/yyyy"),
                Updated = f.LastUpdatedTime.ToString("dd/MM/yyyy")
            };
        }

        private static string? GetElementExtensionValueByOuterName(SyndicationItem item, string outerName)
        {
            if (item.ElementExtensions.All(x => x.OuterName != outerName)) return null;
            return item.ElementExtensions.Single(x => x.OuterName == outerName).GetObject<XElement>().Value;
        }
    }
}
