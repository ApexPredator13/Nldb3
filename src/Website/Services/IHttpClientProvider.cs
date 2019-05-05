using System.Net.Http;

namespace Website.Services
{
    public interface IHttpClientProvider
    {
        HttpClient GetClient();
    }
}
