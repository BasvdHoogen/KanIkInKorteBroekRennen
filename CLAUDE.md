# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This repository is the monorepo for the "Kanikinkortebroekrennen" project: a Vue 3 frontend (at the repo root) and an ASP.NET Core 8 Web API backend (`WebApiKorteBroek/`), combined via `git subtree` from two previously separate repos. It gives a location name, geocodes it via LocationIQ, and returns current weather from Open-Meteo translated into Dutch-language descriptions.

The repo root is the frontend's original identity (`vue-weather-app-try` / GitHub repo `BasvdHoogen/KanIkInKorteBroekRennen`) — the backend was merged in as a subfolder, keeping the frontend's paths and deployment untouched.

## Commands

### Frontend (repo root)
- Install deps: `npm install`
- Dev server (hot reload): `npm run dev`
- Production build: `npm run build` — outputs to `dist/`
- Preview production build: `npm run preview`

### Backend (`WebApiKorteBroek/`)
- Build: `dotnet build KanIkInKorteBroekRennen.sln` (or `dotnet build` from within `WebApiKorteBroek/`)
- Run (dev): `dotnet run --project WebApiKorteBroek` — serves on `http://localhost:5195` (and `https://localhost:7019` under the `https` launch profile), opening Swagger UI at `/swagger` automatically in Development.
- Restore packages: `dotnet restore`

There are no test projects/lint configs for either the frontend or backend.

## Architecture

### Frontend
Vue 3 + Vite app (`src/`, `index.html`, `vite.config.js`). `src/App.vue` is the main component; `src/components/` holds `Loading-wave.vue` and `TheWelcome.vue`. Deployed as an Azure Static Web App.

### Backend (`WebApiKorteBroek/`)
The entire API is implemented in a single top-level-statements file, `WebApiKorteBroek/Program.cs`, with one endpoint:

- `GET /kortebroekinfo?location={location}` — the only route. Flow:
  1. `GetCoordinatesOfLocation(location)` calls the LocationIQ search API to geocode the free-text `location` string into a `LocationData` (lat/long/display name/country). A regex (`([a-z])([A-Z])` → inserts a space) splits camelCase location input into words before querying.
  2. If geocoding succeeds, an `OpenMeteoClient` (from the `OpenMeteo.dotnet` NuGet package) is queried for current weather conditions (temperature, precipitation, wind, cloud cover, weather code, etc.) at those coordinates.
  3. The result is wrapped in a `WeatherForcastResponse` (`WebApiKorteBroek/Classes/WeatherForcastResponse.cs`), which also exposes a derived `WeatherCodeString` property that maps Open-Meteo's numeric weather codes to Dutch-language descriptions (e.g. `0` → "Helderblauwe lucht", `61` → "Lichte regen").
  4. On any failure (geocoding fails, weather query throws), the response has `Succesfull = false`.

Supporting types (`LocationSuggestion`, `Address`, `LocationData`) for parsing the LocationIQ response are defined inline at the bottom of `Program.cs`, not in separate files.

CORS is configured (policy `_policyName`) to allow the production frontend domain (`https://*.kanikinkortebroekrennen.nl`) and local dev origins (`http://localhost:*`, explicitly `:5173`/`:5174`, the typical Vite dev server ports) with any header/method.

Swagger/OpenAPI (Swashbuckle) is enabled only when `app.Environment.IsDevelopment()`.

`KanIkInKorteBroekRennen.sln` at the repo root ties `WebApiKorteBroek.csproj` into a Rider/Visual Studio solution alongside the frontend.

## Deployment

The two halves deploy independently, and neither changed as part of the monorepo merge:

- **Frontend**: `.github/workflows/azure-static-web-apps-jolly-beach-0d25f9a03.yml` runs on every push to `main` (and on PRs against it), building and deploying via the Azure Static Web Apps GitHub Action. `app_location` is `/` and `output_location` is `dist` — both still correct since the frontend files were not moved when the backend was merged in.
- **Backend**: manual publish via the Rider run config `.run/Publish WebApiKorteBroek to Azure.run.xml` (Azure Web App `KorteBroekInfo` in resource group `KorteBroekRennen`, Windows, .NET 8). Not git-triggered.

## Notes

- The LocationIQ API key is read from configuration key `LocationIQ:ApiKey` (`Program.cs`, passed into `GetCoordinatesOfLocation`) — never hardcode it. Locally it's supplied via .NET user-secrets (`dotnet user-secrets set "LocationIQ:ApiKey" "..."` from `WebApiKorteBroek/`, project's `UserSecretsId` is already set in the `.csproj`). In Azure, set it as an App Service Application Setting named `LocationIQ__ApiKey` (double underscore — Azure App Settings map to nested config via `__`).
- The backend was previously its own git repo (nested inside a separate, non-git `Solution3` folder) with no remote; its single-commit history was preserved via `git subtree add` when merging.
