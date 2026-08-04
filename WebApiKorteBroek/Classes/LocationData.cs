using System.Text.Json.Serialization;

namespace WebApiKorteBroek.Classes;

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

public class LocationData
{
    public string Name { get; set; }
    public float Latitude { get; set; }
    public float Longitude { get; set; }
    public string CountryCode { get; set; }
    public string Country { get; set; }
}
