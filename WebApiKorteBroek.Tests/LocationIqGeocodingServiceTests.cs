using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using WebApiKorteBroek.Services;

namespace WebApiKorteBroek.Tests;

public class LocationIqGeocodingServiceTests
{
    private static LocationIqGeocodingService CreateService(FakeHttpMessageHandler handler)
    {
        var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://eu1.locationiq.com") };
        var configuration = new ConfigurationBuilder().Build();
        return new LocationIqGeocodingService(httpClient, configuration, NullLogger<LocationIqGeocodingService>.Instance);
    }

    [Fact]
    public async Task GetCoordinatesAsync_SuccessfulResponse_ReturnsParsedLocationData()
    {
        var handler = FakeHttpMessageHandler.ReturningJson(HttpStatusCode.OK, TestData.ValidLocationIqResponse);
        var service = CreateService(handler);

        var result = await service.GetCoordinatesAsync("Eindhoven");

        Assert.NotNull(result);
        Assert.Equal("Eindhoven, Noord-Brabant, Nederland", result!.Name);
        Assert.Equal(51.4416f, result.Latitude);
        Assert.Equal(5.4697f, result.Longitude);
        Assert.Equal("nl", result.CountryCode);
        Assert.Equal("Nederland", result.Country);
    }

    [Fact]
    public async Task GetCoordinatesAsync_CamelCaseInput_InsertsSpaceBeforeQuerying()
    {
        var handler = FakeHttpMessageHandler.ReturningJson(HttpStatusCode.OK, TestData.ValidLocationIqResponse);
        var service = CreateService(handler);

        await service.GetCoordinatesAsync("DenBosch");

        Assert.Contains("q=Den%20Bosch", handler.LastRequest!.RequestUri!.Query);
    }

    [Fact]
    public async Task GetCoordinatesAsync_NonSuccessStatusCode_ReturnsNull()
    {
        var handler = FakeHttpMessageHandler.ReturningJson(HttpStatusCode.InternalServerError, "");
        var service = CreateService(handler);

        var result = await service.GetCoordinatesAsync("Eindhoven");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetCoordinatesAsync_MalformedJson_ReturnsNullInsteadOfThrowing()
    {
        var handler = FakeHttpMessageHandler.ReturningJson(HttpStatusCode.OK, "not valid json");
        var service = CreateService(handler);

        var result = await service.GetCoordinatesAsync("Eindhoven");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetCoordinatesAsync_EmptyResultArray_ReturnsNull()
    {
        var handler = FakeHttpMessageHandler.ReturningJson(HttpStatusCode.OK, "[]");
        var service = CreateService(handler);

        var result = await service.GetCoordinatesAsync("NonexistentPlace123");

        Assert.Null(result);
    }
}
