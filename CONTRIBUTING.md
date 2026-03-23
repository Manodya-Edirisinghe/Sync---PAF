# Contributing Guide

## Branching Strategy

- `main`: stable and releasable.
- `develop`: integration branch for ongoing work.
- Feature branches: `feat/<short-name>`.
- Bugfix branches: `fix/<short-name>`.
- Chore branches: `chore/<short-name>`.

## Commit Message Convention

Use Conventional Commits:

- `feat: add booking approval endpoint`
- `fix: handle null reporter in ticket mapping`
- `docs: update local setup section`

## Pull Request Rules

- Keep PRs focused and under ~400 lines when possible.
- Link issue/task in the PR description.
- Ensure CI is green before requesting review.
- Require at least 1 reviewer approval.

## Local Setup

1. Backend:

```bash
mvn spring-boot:run
```

2. Frontend:

```bash
npm --prefix ui install
npm --prefix ui run dev
```

## Quality Gates

Before pushing:

```bash
mvn test
npm --prefix ui run lint
npm --prefix ui run build
```

## Code Style

- Respect `.editorconfig`.
- Do not commit generated build output.
- Prefer small classes/modules with clear responsibilities.
