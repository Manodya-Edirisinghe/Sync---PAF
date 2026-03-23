# Architecture Overview

## System

The project is split into two primary applications:

- Backend: Spring Boot application in repository root.
- Frontend: React + Vite application in `ui/`.

## Backend Layers

Current package structure follows domain-first organization:

- `bookings/`
- `facilities/`
- `incidents/`
- `users/`

Each domain currently contains entity and repository modules.

Suggested evolution for each domain:

- `controller/` for HTTP endpoints
- `service/` for business logic
- `dto/` for API payloads
- `mapper/` for transformations
- `entity/` and `repository/` for persistence

## Data

- Default profile (`application.yml`): in-memory H2 for zero-friction local startup.
- Local profile (`application-local.yml`): PostgreSQL for realistic dev testing.

## Frontend

UI app is organized by:

- `components/` reusable UI components
- `stores/` application state
- `lib/` utility functions

Suggested evolution:

- `features/<domain>/` for feature-oriented modules
- `api/` for HTTP client and contracts
- `routes/` for route-level composition

## Cross-Cutting

- CI: `.github/workflows/ci.yml`
- Contribution process: `CONTRIBUTING.md`
- Team workflow: `docs/TEAM_WORKFLOW.md`
