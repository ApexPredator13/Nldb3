using System.Net.Http;
using Website.Services;

namespace Website.Infrastructure
{
    public class HttpClientProvider : IHttpClientProvider
    {
        private readonly HttpClient _httpClient;

        public HttpClientProvider()
        {
            _httpClient = new HttpClient();
        }

        public HttpClient GetClient()
        {
            return _httpClient;
        }
    }
}
