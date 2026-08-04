using System.Net;

namespace WebApiKorteBroek.Tests;

public class FakeHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
{
    public HttpRequestMessage? LastRequest { get; private set; }

    public static FakeHttpMessageHandler ReturningJson(HttpStatusCode statusCode, string json) =>
        new(_ => new HttpResponseMessage(statusCode) { Content = new StringContent(json) });

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        LastRequest = request;
        return Task.FromResult(respond(request));
    }
}
