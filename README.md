# Smart Campus Operations Hub

Smart Campus Operations Hub is a full-stack project for managing campus operations such as bookings, facilities, incidents, and users.

## Tech Stack

- Backend: Spring Boot 3, Spring Data JPA, Spring Security
- Database: H2 (default), PostgreSQL (local profile)
- Frontend: React, TypeScript, Vite, Tailwind
- DevOps: Docker Compose, GitHub Actions CI

## Repository Structure

```text
.
|- src/                    # Spring Boot backend source
|- ui/                     # React + Vite frontend
|- docs/                   # Architecture and team workflow docs
|- .github/workflows/      # CI workflows
|- docker-compose.yml      # Local PostgreSQL service
`- pom.xml                 # Backend build configuration
```

## Quick Start

1. Start backend (default H2 profile):

```bash
mvn spring-boot:run
```

2. Start frontend:

```bash
npm --prefix ui install
npm --prefix ui run dev
```

Frontend runs on `http://localhost:5173` (or next available port).
Backend runs on `http://localhost:8080`.

## PostgreSQL Profile (Optional)

For realistic local DB testing:

```bash
docker compose up -d postgres
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

## Team Standards

- Contribution guide: `CONTRIBUTING.md`
- Architecture notes: `docs/ARCHITECTURE.md`
- Team process: `docs/TEAM_WORKFLOW.md`
- PR template: `.github/pull_request_template.md`

## CI

GitHub Actions validates backend and frontend on pushes and pull requests:

- Backend: `mvn -B verify`
- Frontend: `npm ci`, `npm run lint`, `npm run build`

## Recommended Workflow

1. Create an issue with acceptance criteria.
2. Create a feature branch from `develop`.
3. Implement and run local checks.
4. Open PR using the template.
5. Merge after review and green CI.
