# Kanikinkortebroekrennen

Give it a location and it tells you, in Dutch, whether you can run in short pants today. Geocodes the location via LocationIQ and pulls current weather from Open-Meteo.

This is a monorepo: a Vue 3 frontend at the repo root, and an ASP.NET Core Web API backend in `WebApiKorteBroek/`, combined via `git subtree` from two previously separate repos.

## Frontend (repo root)

```sh
npm install
npm run dev       # dev server with hot reload, http://localhost:5173
npm run build     # type-checks then builds for production, outputs to dist/
npm run preview   # preview the production build locally
npm run lint       # ESLint
npm run type-check # vue-tsc, no emit
```

The backend API base URL is read from `VITE_API_BASE_URL` (see `.env` for local dev, `.env.production` for the deployed backend). Override locally with a `.env.local` file if needed.

## Backend (`WebApiKorteBroek/`)

```sh
dotnet build KanIkInKorteBroekRennen.sln   # or `dotnet build` from within WebApiKorteBroek/
dotnet run --project WebApiKorteBroek       # http://localhost:5195, Swagger UI at /swagger
dotnet restore
```

The main API is a single minimal-API endpoint (`GET /kortebroekinfo?location={location}`) implemented in `WebApiKorteBroek/Program.cs`, plus a `GET /health` check. See `CLAUDE.md` for the full architecture writeup.

The LocationIQ API key is required to run the backend locally. Set it via .NET user-secrets from `WebApiKorteBroek/`:

```sh
dotnet user-secrets set "LocationIQ:ApiKey" "<your-key>"
```

There are no automated test projects for either half of the repo yet.

## Deployment

The two halves deploy independently:

- **Frontend**: `.github/workflows/frontend-deploy.yml` deploys to Azure Static Web Apps on every push to `main`. Pull requests against `main` also trigger a build, but Azure Static Web Apps treats that as an isolated **staging** preview environment (usually linked in a PR comment) — production is only updated when a PR is actually merged.
- **Backend**: `.github/workflows/backend-deploy.yml` deploys to the Azure Web App `KorteBroekInfo` on every push to `main` that touches `WebApiKorteBroek/**`, or manually via `workflow_dispatch`.

## More detail

`CLAUDE.md` has the full architecture and conventions writeup used to brief Claude Code on this repo — worth a read for anyone new to the project too.
