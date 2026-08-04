using OpenMeteo;

namespace WebApiKorteBroek.Services;

public class OpenMeteoWeatherService
{
    public virtual async Task<WeatherForecast?> GetCurrentWeatherAsync(float latitude, float longitude)
    {
        var openMeteoClient = new OpenMeteoClient();

        var weatherOptions = new WeatherForecastOptions
        {
            Timezone = "auto",
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

        return await openMeteoClient.QueryAsync(weatherOptions);
    }
}
