using OpenMeteo;

namespace WebApiKorteBroek.Classes;

public class WeatherForcastResponse
{
    public WeatherForecast? WeatherForecast { get; set; }
    
    public string? WeatherCodeString
    {
        get { return WeathercodeToString(WeatherForecast?.Current?.Weathercode ?? 100); }
        private set { }
    }
    public string? RequestedLocation { get; set; }
    public string? LocationDisplayName { get; set; } 
    public bool Succesfull { get; set; }
    
    
    /// <summary>
    /// Converts a given weathercode to it's string representation
    /// </summary>
    /// <param name="weathercode"></param>
    /// <returns><see cref="string"/> Weathercode string representation</returns>
    private string WeathercodeToString(int weathercode)
    {
        switch (weathercode)
        {
            case 0:
                return "Helderblauwe lucht";
            case 1:
                return "Hoofdzakelijk helder";
            case 2:
                return "Gedeeltelijk bewolkt";
            case 3:
                return "Bewolkt";
            case 45:
                return "Mist";
            case 48:
                return "Aanvriezende mist";
            case 51:
                return "Lichte motregen";
            case 53:
                return "Matige motregen";
            case 55:
                return "Dichte motregen";
            case 56:
                return "Lichte bevroren motregen";
            case 57:
                return "Dichte bevroren motregen";
            case 61:
                return "Lichte regen";
            case 63:
                return "Matige regen";
            case 65:
                return "Zware regen";
            case 66:
                return "Lichte bevroren regen";
            case 67:
                return "Zware bevroren regen";
            case 71:
                return "Lichte sneeuwval";
            case 73:
                return "Matige sneeuwval";
            case 75:
                return "Zware sneeuwval";
            case 77:
                return "Sneeuwkorrels";
            case 80:
                return "Lichte regenbuien";
            case 81:
                return "Matige regenbuien";
            case 82:
                return "Heftige regenbuien";
            case 85:
                return "Lichte sneeuwbuien";
            case 86:
                return "Zware sneeuwbuien";
            case 95:
                return "Onweersbui";
            case 96:
                return "Onweersbui met lichte hagel";
            case 99:
                return "Onweersbui met zware hagel";
            default:
                return "Ongeldige weercode";
        }
    }
}