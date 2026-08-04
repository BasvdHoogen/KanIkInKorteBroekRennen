using OpenMeteo.Weather.Forecast.ResponseModel;
using WebApiKorteBroek.Classes;

namespace WebApiKorteBroek.Tests;

public class WeatherForcastResponseTests
{
    [Theory]
    [InlineData(0, "Helderblauwe lucht")]
    [InlineData(61, "Lichte regen")]
    [InlineData(95, "Onweersbui")]
    [InlineData(12345, "Ongeldige weercode")]
    public void WeatherCodeString_MapsKnownAndUnknownCodes(int weathercode, string expected)
    {
        var response = new WeatherForcastResponse
        {
            WeatherForecast = new WeatherForecast
            {
                Current = new Current { Weathercode = weathercode }
            }
        };

        Assert.Equal(expected, response.WeatherCodeString);
    }

    [Fact]
    public void WeatherCodeString_NullWeatherForecast_ReturnsDefaultMapping()
    {
        var response = new WeatherForcastResponse();

        Assert.Equal("Ongeldige weercode", response.WeatherCodeString);
    }
}
