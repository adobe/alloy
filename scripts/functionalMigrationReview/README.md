# Functional Migration Review

This script inventories the original TestCafe tests and migrated Vitest tests
with `ast-grep`, then reports structural differences by test case ID. It reads
both versions directly from Git refs and does not modify the worktree.

Review every migration worktree in one pass:

```bash
pnpm review:functional-migration-stack \
  --output-dir /tmp/alloy-functional-migration-review
```

The stack command writes a browsable `index.html` plus self-contained HTML,
Markdown, and JSON reports for every `migrate-integration/*` worktree. HTML
reports include source diffs, search, status filters, and full structural
evidence. Scope is inferred from changed integration specs, migrated case IDs,
and functional files deleted anywhere in branch history.

Generate a category report:

```bash
pnpm review:functional-migration \
  --base migrate-integration/00-infra \
  --branch migrate-integration/10-consent \
  --category Consent \
  --format html \
  --output /tmp/consent-review.html
```

Optionally generate a detailed packet for one case:

```bash
pnpm review:functional-migration \
  --base migrate-integration/00-infra \
  --branch migrate-integration/10-consent \
  --category Consent \
  --id C1472434 \
  --output /tmp/C1472434-review.md
```

Use the result as triage:

- Red: inspect and fix before deleting the functional test.
- Yellow: compare the reported async or state semantics.
- Green: fast-review the test and its request assertions.

Green means no structural difference was detected. It is not proof of
behavioral equivalence. After approving a case, run its integration test and
delete the corresponding functional test as the review marker.

Directories default to the category name. Use `--functional-path` or
`--integration-path` when a migration changes folder names. Only files directly
inside each directory are included, so Consent and Consent/IAB remain separate
reviews.
