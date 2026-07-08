---
name: git-team-workflow
description: >
  This skill should be used when the user asks about "git branching strategy",
  "conventional commits", "PR review process", "rebase vs merge", "squash
  merge", or discusses team git conventions and pull request hygiene.
version: 1.0.0
---

## Git Team Workflow

### Branching — short-lived, trunk-based

```
main                    ← always releasable, protected
└── feat/PROJ-142-product-import   ← branch per task, merged within days
```

- Branch names: `feat/…`, `fix/…`, `chore/…` + ticket id.
- Rebase your branch on `main` before opening the PR; **never** rebase shared
  branches.
- Squash-merge to keep `main` one-commit-per-change and trivially revertable.

### Conventional commits

```
feat(import): add CSV product import with duplicate detection
fix(api): return 404 instead of 500 for missing product
chore(deps): bump fastify to 5.2
refactor(orders)!: replace status strings with enum

BREAKING CHANGE: order.status values changed
```

`type(scope): imperative summary` ≤ 72 chars. Enables auto-changelogs and
semantic-release; enforce with commitlint in CI.

### PR hygiene — speed comes from small

- **≤ ~400 changed lines.** Review quality collapses beyond that; split by
  refactor-then-feature or stacked PRs.
- Description says **why**, links the ticket, and states how it was tested.
- CI green before requesting review; self-review the diff first — you'll catch
  half the comments yourself.
- Reviewers respond within one business day; blocking comments distinguish
  "must fix" from "nit:".

### Commands worth knowing

```bash
git rebase -i main               # clean up WIP commits before PR (interactive locally)
git commit --fixup <sha> && git rebase --autosquash main
git bisect start                 # binary-search the commit that broke it
git worktree add ../hotfix main  # second working copy — no stash dance
git revert <sha>                 # undo on shared branches (never force-push main)
```

### Rules of thumb

- Protect `main`: required CI + at least one review; no force pushes.
- Commit generated lockfiles; never commit secrets, `.env`, or build output.
- Feature flags for half-done work beat long-lived branches — merge early,
  toggle off.
