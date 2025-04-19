using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using OpenMeteo;
using WebApiKorteBroek.Classes;

var builder = WebApplication.CreateBuilder(args);
const string policyName = "_policyName";
string[] myAllowSpecificOrigins =
    ["https://*.kanikinkortebroekrennen.nl", "http://localhost:*", "http://localhost:5174", "http://localhost:5173"];

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(name: policyName, policyBuilder =>
    {
        policyBuilder.WithOrigins(myAllowSpecificOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(policyName);

app.UseHttpsRedirection();

app.MapGet("/kortebroekinfo", async Task<WeatherForcastResponse> (string location = "Eindhoven") =>
        {
            var locationData = await GetCoordinatesOfLocation(location);

            if (locationData == null)
            {
                return new WeatherForcastResponse()
                {
                    Succesfull = false
                };
            }
            
            try
            {
                var openMeteoClient = new OpenMeteoClient();

                var weatherOptions = new WeatherForecastOptions
                {
                    Timezone = "auto",
                    Longitude = locationData.Longitude,
                    Latitude = locationData.Latitude,
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
                WeatherForecast? weatherForecast = await openMeteoClient.QueryAsync(weatherOptions);
                if (weatherForecast != null)
                {
                    var weatherCodeString = weatherForecast.Current?.Weathercode != null
                        ? openMeteoClient.WeathercodeToString((int)weatherForecast.Current.Weathercode)
                        : string.Empty;

                    return new WeatherForcastResponse()
                    {
                        WeatherForecast = weatherForecast,
                        RequestedLocation = location,
                        LocationDisplayName = locationData.Name,
                        Succesfull = true,
                    };
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
            
            return new WeatherForcastResponse()
            {
                Succesfull = false
            };
        }
    )
    .WithName("KorteBroekInfo")
    .WithOpenApi();

app.Run();
return;


async Task<LocationData?> GetCoordinatesOfLocation(string inputLocation)
{
    try
    {
        using HttpClient httpClient = new HttpClient();

        inputLocation = Regex.Replace(inputLocation, "([a-z])([A-Z])", "$1 $2");
        var response =
            await httpClient.GetAsync(
                $"https://eu1.locationiq.com/v1/search?q={inputLocation}&format=json&addressdetails=1&accept-language=nl&key=pk.0d013e7ee41069cf4c54c1b82e92cb00");

        if (!response.IsSuccessStatusCode) return null;
        
        var jsonString = await response.Content.ReadAsStringAsync();
        List<LocationSuggestion>? locationSuggestionListResult = JsonSerializer.Deserialize<List<LocationSuggestion>>(jsonString);

        if (locationSuggestionListResult == null) return null;
        
        var locationData = new LocationData
        {
            Name = locationSuggestionListResult[0].DisplayName,
            Latitude = float.Parse(locationSuggestionListResult[0].Lat),
            Longitude = float.Parse(locationSuggestionListResult[0].Lon),
            CountryCode = locationSuggestionListResult[0].Address.country_code,
            Country = locationSuggestionListResult[0].Address.country
        };
        return locationData;
    }
    catch (Exception ex)
    {
        Console.WriteLine("Exception: " + ex);
    }

    return null;
}

public class LocationSuggestion
{
    [JsonIgnore] public string PlaceId { get; set; }

    [JsonIgnore] public Uri Licence { get; set; }

    [JsonIgnore] public string OsmType { get; set; }

    [JsonIgnore] public string OsmId { get; set; }

    [JsonPropertyName("boundingbox")] public string[] Boundingbox { get; set; }

    [JsonPropertyName("lat")] public string Lat { get; set; }

    [JsonPropertyName("lon")] public string Lon { get; set; }

    [JsonPropertyName("display_name")] public string DisplayName { get; set; }

    [JsonIgnore] public string Class { get; set; }

    [JsonIgnore] public string Type { get; set; }

    [JsonPropertyName("importance")] public double Importance { get; set; }

    [JsonIgnore] public Uri Icon { get; set; }

    [JsonPropertyName("address")] public Address Address { get; set; }
}

public class Address
{
    public string city { get; set; }
    [JsonIgnore] public string state { get; set; }
    public string country { get; set; }
    public string country_code { get; set; }
    public string city_district { get; set; }
    public string station { get; set; }
    public string house_number { get; set; }
    public string road { get; set; }
    public string neighbourhood { get; set; }
    public string suburb { get; set; }
    [JsonIgnore] public string postcode { get; set; }
    [JsonIgnore] public string town { get; set; }
    [JsonIgnore] public string county { get; set; }
    [JsonIgnore] public string ambulance_station { get; set; }
    [JsonIgnore] public string art { get; set; }
    [JsonIgnore] public string quarter { get; set; }
}