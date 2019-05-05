namespace Website.Models.ChannelData
{
    public class YoutubeNotification
    {
        public string Id { get; set; } = string.Empty;
        public string? VideoId { get; set; } = string.Empty;
        public string? ChannelId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Link { get; set; } = string.Empty;
        public Author Author { get; set; } = new Author();
        public string Published { get; set; } = string.Empty;
        public string Updated { get; set; } = string.Empty;
    }
}

