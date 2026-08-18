using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.RegularExpressions;
using WebApiKorteBroek.Classes;
using WebApiKorteBroek.Services;

var builder = WebApplication.CreateBuilder(args);
const string policyName = "_policyName";
const string rateLimitPolicyName = "fixed";
string[] myAllowSpecificOrigins =
    ["https://*.kanikinkortebroekrennen.nl", "http://localhost:*", "http://localhost:5174", "http://localhost:5173"];

// Matches this app's Azure Static Web App production and PR-preview subdomains
// (e.g. jolly-beach-0d25f9a03-23.westeurope.4.azurestaticapps.net), so PR previews
// can call this backend without widening CORS to all of *.azurestaticapps.net.
var staticWebAppOriginPattern = new Regex(
    @"^https://jolly-beach-0d25f9a03(-\d+)?\.westeurope\.4\.azurestaticapps\.net$",
    RegexOptions.IgnoreCase);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(opt =>
{
    var corsPolicy = new CorsPolicyBuilder(myAllowSpecificOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .SetIsOriginAllowedToAllowWildcardSubdomains()
        .Build();

    var isOriginAllowed = corsPolicy.IsOriginAllowed;
    corsPolicy.IsOriginAllowed = origin => isOriginAllowed(origin) || staticWebAppOriginPattern.IsMatch(origin);

    opt.AddPolicy(policyName, corsPolicy);
});
builder.Services.AddProblemDetails();
builder.Services.AddHttpClient<LocationIqGeocodingService>();
builder.Services.AddSingleton<OpenMeteoWeatherService>();
builder.Services.AddHealthChecks();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter(rateLimitPolicyName, opt =>
    {
        opt.PermitLimit = 30;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

var app = builder.Build();

app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(policyName);

app.UseHttpsRedirection();

app.UseRateLimiter();

app.MapHealthChecks("/health");

app.MapGet("/kortebroekinfo", async Task<WeatherForcastResponse> (
            LocationIqGeocodingService geocodingService,
            OpenMeteoWeatherService weatherService,
            string location = "Eindhoven") =>
        {
            var locationData = await geocodingService.GetCoordinatesAsync(location);

            if (locationData == null)
            {
                return new WeatherForcastResponse()
                {
                    Succesfull = false
                };
            }

            try
            {
                var weatherForecast = await weatherService.GetCurrentWeatherAsync(locationData.Latitude, locationData.Longitude);
                if (weatherForecast != null)
                {
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
                app.Logger.LogError(e, "Failed to fetch weather forecast for location {Location}", location);
                throw;
            }

            return new WeatherForcastResponse()
            {
                Succesfull = false
            };
        }
    )
    .WithName("KorteBroekInfo")
    .RequireRateLimiting(rateLimitPolicyName);

app.Run();

public partial class Program { }
