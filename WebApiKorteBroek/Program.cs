using Microsoft.AspNetCore.RateLimiting;
using WebApiKorteBroek.Classes;
using WebApiKorteBroek.Services;

var builder = WebApplication.CreateBuilder(args);
const string policyName = "_policyName";
const string rateLimitPolicyName = "fixed";
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
