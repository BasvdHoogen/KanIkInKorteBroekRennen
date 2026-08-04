using OpenMeteo;
using OpenMeteo.Weather.Forecast.Options;
using OpenMeteo.Weather.Forecast.ResponseModel;

namespace WebApiKorteBroek.Services;

public class OpenMeteoWeatherService
{
    public virtual async Task<WeatherForecast?> GetCurrentWeatherAsync(float latitude, float longitude)
    {
        var openMeteoClient = new OpenMeteoClient { RethrowExceptions = true };

        var weatherOptions = new WeatherForecastOptions
        {
            // Not "auto": the SDK's date parser resolves this string directly via
            // TimeZoneInfo.FindSystemTimeZoneById, which throws for Open-Meteo's
            // "auto" request value. We don't consume the timestamp fields downstream,
            // so a fixed, universally-resolvable zone has no functional effect.
            Timezone = "UTC",
            Longitude = longitude,
            Latitude = latitude,
            Current = new CurrentOptions([
                CurrentOptionsParameter.temperature_2m,
                CurrentOptionsParameter.apparent_temperature,
                CurrentOptionsParameter.relativehumidity_2m,
                CurrentOptionsParameter.precipitation,
                CurrentOptionsParameter.rain,
                CurrentOptionsParameter.showers,
                CurrentOptionsParameter.snowfall,
                CurrentOptionsParameter.weathercode,
                CurrentOptionsParameter.cloudcover,
                CurrentOptionsParameter.windspeed_10m,
                CurrentOptionsParameter.winddirection_10m,
                CurrentOptionsParameter.windgusts_10m
            ])
        };

        return await openMeteoClient.QueryWeatherApiAsync(weatherOptions);
    }
}
