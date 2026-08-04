using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using OpenMeteo;
using WebApiKorteBroek.Services;

namespace WebApiKorteBroek.Tests;

public class KorteBroekInfoEndpointTests
{
    private static WebApplicationFactory<Program> CreateFactory(
        HttpStatusCode geocodingStatusCode,
        string geocodingResponseBody,
        Mock<OpenMeteoWeatherService> weatherMock)
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddHttpClient<LocationIqGeocodingService>()
                    .ConfigurePrimaryHttpMessageHandler(() =>
                        FakeHttpMessageHandler.ReturningJson(geocodingStatusCode, geocodingResponseBody));

                services.RemoveAll<OpenMeteoWeatherService>();
                services.AddSingleton(weatherMock.Object);
            });
        });
    }

    [Fact]
    public async Task KorteBroekInfo_GeocodingFails_ReturnsUnsuccessfulAndSkipsWeatherCall()
    {
        var weatherMock = new Mock<OpenMeteoWeatherService>();
        var factory = CreateFactory(HttpStatusCode.InternalServerError, "", weatherMock);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/kortebroekinfo?location=Nergenshuizen");
        var body = await ReadJsonAsync(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(body.GetProperty("succesfull").GetBoolean());
        weatherMock.Verify(w => w.GetCurrentWeatherAsync(It.IsAny<float>(), It.IsAny<float>()), Times.Never);
    }

    [Fact]
    public async Task KorteBroekInfo_GeocodingAndWeatherSucceed_ReturnsSuccessfulResponse()
    {
        var weatherMock = new Mock<OpenMeteoWeatherService>();
        weatherMock
            .Setup(w => w.GetCurrentWeatherAsync(51.4416f, 5.4697f))
            .ReturnsAsync(new WeatherForecast
            {
                Latitude = 51.4416f,
                Longitude = 5.4697f,
                Current = new Current { Temperature_2m = 20f, Apparent_temperature = 19f, Weathercode = 0 }
            });
        var factory = CreateFactory(HttpStatusCode.OK, TestData.ValidLocationIqResponse, weatherMock);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/kortebroekinfo?location=Eindhoven");
        var body = await ReadJsonAsync(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(body.GetProperty("succesfull").GetBoolean());
        Assert.Equal("Eindhoven", body.GetProperty("requestedLocation").GetString());
        Assert.Equal("Eindhoven, Noord-Brabant, Nederland", body.GetProperty("locationDisplayName").GetString());
        Assert.Equal(20f, body.GetProperty("weatherForecast").GetProperty("current").GetProperty("temperature_2m").GetSingle());
    }

    [Fact]
    public async Task KorteBroekInfo_WeatherServiceThrows_ReturnsProblemDetailsResponse()
    {
        var weatherMock = new Mock<OpenMeteoWeatherService>();
        weatherMock
            .Setup(w => w.GetCurrentWeatherAsync(It.IsAny<float>(), It.IsAny<float>()))
            .ThrowsAsync(new InvalidOperationException("Open-Meteo is down"));
        var factory = CreateFactory(HttpStatusCode.OK, TestData.ValidLocationIqResponse, weatherMock);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/kortebroekinfo?location=Eindhoven");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var weatherMock = new Mock<OpenMeteoWeatherService>();
        var factory = CreateFactory(HttpStatusCode.OK, "[]", weatherMock);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response)
    {
        var stream = await response.Content.ReadAsStreamAsync();
        using var document = await JsonDocument.ParseAsync(stream);
        return document.RootElement.Clone();
    }
}
