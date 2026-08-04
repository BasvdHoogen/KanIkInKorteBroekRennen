using System.Text.Json;
using System.Text.RegularExpressions;
using WebApiKorteBroek.Classes;

namespace WebApiKorteBroek.Services;

public class LocationIqGeocodingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<LocationIqGeocodingService> _logger;
    private readonly string? _apiKey;

    public LocationIqGeocodingService(HttpClient httpClient, IConfiguration configuration, ILogger<LocationIqGeocodingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = configuration["LocationIQ:ApiKey"];
    }

    public virtual async Task<LocationData?> GetCoordinatesAsync(string inputLocation)
    {
        try
        {
            inputLocation = Regex.Replace(inputLocation, "([a-z])([A-Z])", "$1 $2");
            var encodedLocation = Uri.EscapeDataString(inputLocation);
            var response =
                await _httpClient.GetAsync(
                    $"https://eu1.locationiq.com/v1/search?q={encodedLocation}&format=json&addressdetails=1&accept-language=nl&key={_apiKey}");

            if (!response.IsSuccessStatusCode) return null;

            var jsonString = await response.Content.ReadAsStringAsync();
            List<LocationSuggestion>? locationSuggestionListResult = JsonSerializer.Deserialize<List<LocationSuggestion>>(jsonString);

            if (locationSuggestionListResult == null || locationSuggestionListResult.Count == 0) return null;

            return new LocationData
            {
                Name = locationSuggestionListResult[0].DisplayName,
                Latitude = float.Parse(locationSuggestionListResult[0].Lat),
                Longitude = float.Parse(locationSuggestionListResult[0].Lon),
                CountryCode = locationSuggestionListResult[0].Address.country_code,
                Country = locationSuggestionListResult[0].Address.country
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to geocode location {InputLocation}", inputLocation);
        }

        return null;
    }
}
