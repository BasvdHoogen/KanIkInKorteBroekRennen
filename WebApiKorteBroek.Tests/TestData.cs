namespace WebApiKorteBroek.Tests;

internal static class TestData
{
    public const string ValidLocationIqResponse = """
        [
          {
            "place_id": "123",
            "boundingbox": ["51.0", "51.1", "5.0", "5.1"],
            "lat": "51.4416",
            "lon": "5.4697",
            "display_name": "Eindhoven, Noord-Brabant, Nederland",
            "importance": 0.7,
            "address": {
              "city": "Eindhoven",
              "country": "Nederland",
              "country_code": "nl"
            }
          }
        ]
        """;
}
