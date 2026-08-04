using System.Text.Json.Serialization;

namespace WebApiKorteBroek.Classes;

public class LocationSuggestion
{
    [JsonIgnore] public string PlaceId { get; set; } = null!;

    [JsonIgnore] public Uri Licence { get; set; } = null!;

    [JsonIgnore] public string OsmType { get; set; } = null!;

    [JsonIgnore] public string OsmId { get; set; } = null!;

    [JsonPropertyName("boundingbox")] public string[] Boundingbox { get; set; } = null!;

    [JsonPropertyName("lat")] public string Lat { get; set; } = null!;

    [JsonPropertyName("lon")] public string Lon { get; set; } = null!;

    [JsonPropertyName("display_name")] public string DisplayName { get; set; } = null!;

    [JsonIgnore] public string Class { get; set; } = null!;

    [JsonIgnore] public string Type { get; set; } = null!;

    [JsonPropertyName("importance")] public double Importance { get; set; }

    [JsonIgnore] public Uri Icon { get; set; } = null!;

    [JsonPropertyName("address")] public Address Address { get; set; } = null!;
}

public class Address
{
    public string city { get; set; } = null!;
    [JsonIgnore] public string state { get; set; } = null!;
    public string country { get; set; } = null!;
    public string country_code { get; set; } = null!;
    public string city_district { get; set; } = null!;
    public string station { get; set; } = null!;
    public string house_number { get; set; } = null!;
    public string road { get; set; } = null!;
    public string neighbourhood { get; set; } = null!;
    public string suburb { get; set; } = null!;
    [JsonIgnore] public string postcode { get; set; } = null!;
    [JsonIgnore] public string town { get; set; } = null!;
    [JsonIgnore] public string county { get; set; } = null!;
    [JsonIgnore] public string ambulance_station { get; set; } = null!;
    [JsonIgnore] public string art { get; set; } = null!;
    [JsonIgnore] public string quarter { get; set; } = null!;
}

public class LocationData
{
    public string Name { get; set; } = null!;
    public float Latitude { get; set; }
    public float Longitude { get; set; }
    public string CountryCode { get; set; } = null!;
    public string Country { get; set; } = null!;
}
