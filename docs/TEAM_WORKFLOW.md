# Team Workflow

## Planning

- Track work as issues with clear acceptance criteria.
- Assign one owner per issue.
- Split large tasks into backend/frontend subtasks.

## Delivery Cycle

1. Create issue.
2. Create branch from `develop`.
3. Implement and test locally.
4. Open PR to `develop`.
5. Review, update, and merge.
6. Periodically promote `develop` to `main` for release.

## Definition of Done

A task is done when:

- Code is merged via PR.
- CI passes.
- Tests/lint/build pass locally.
- Docs are updated (if behavior changed).

## Review Standards

- Validate correctness first.
- Look for security and data integrity concerns.
- Check readability and maintainability.
- Reject PRs with unrelated changes.

## Release Hygiene

- Tag release commits on `main`.
- Keep release notes in PR descriptions or a dedicated changelog.
