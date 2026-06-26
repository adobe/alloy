## Context

The team manages JIRA tickets for the AEP Web SDK (project `PDCL` at `jira.corp.adobe.com`) manually through the browser. Existing scripts in `scripts/createJiraTicket.js` and `scripts/team/` (api.js, config.js, token.js) were written to automate ticket creation but have never been adopted team-wide because they require individual token setup and don't integrate with the PR review process.

The new system treats `.jira/*.yml` files as the source of truth for pending JIRA changes. A GitHub Actions workflow applies them on merge. A Claude Code action creates/updates these files locally during development.

Custom field IDs used in the PDCL project:
- `components`: `[{ id: "155901" }]` (AEP Web SDK)
- `customfield_23300`: `{ id: "116005" }` (product)
- Documentation component: `{ id: "157512" }`
- Issue types: bug `1`, story `7`, documentation `14801`
- Base URL: `https://jira.corp.adobe.com`

## Goals / Non-Goals

**Goals:**
- All JIRA changes made via PR are auditable, reviewable, and version-controlled
- Apply step is idempotent — re-running the workflow never creates duplicate tickets or duplicate updates
- Local authoring (propose) makes zero JIRA API calls
- YAML files are human-readable and support inline comments for custom field documentation
- Remote link to the merged PR is always created in JIRA as part of apply
- PR review is the approval mechanism for JIRA changes — `/jira-propose` writes files locally with no external effect, so developers can write ticket files freely without prior sign-off

**Non-Goals:**
- Real-time JIRA → repo sync (the `details` snapshot is a one-time capture, not kept live)
- Automated backfill of historical tickets
- Creating tickets in JIRA projects other than PDCL (fetch can read any project key; only PDCL ticket creation is supported by apply)
- Replacing the JIRA UI for complex ticket authoring (descriptions, attachments, etc.)

## Decisions

### YAML over JSON for ticket files
**Decision**: Use YAML with inline comments.  
**Rationale**: Custom field IDs like `customfield_23300` are opaque. YAML lets authors add `# AEP Web SDK product field` next to each custom field so the file is self-documenting. The apply script converts YAML bodies to JSON before sending to the REST API.  
**Alternative**: JSON with a separate field-map file — rejected because it separates documentation from the data.

### REST call array (`updates`) rather than a declarative diff
**Decision**: `updates` is an ordered array of `{ path, method, body }` objects.  
**Rationale**: JIRA's REST API is operation-based (edit fields via PUT/POST with specific payloads). A declarative diff would require a JIRA-specific diff engine. The array approach maps directly to the API and keeps the schema simple.  
**Idempotency**: All `body.update` payloads use `set` operations, never `add`/`remove`. The apply script skips updates when the remote link already exists (checked before applying).

### Remote link as idempotency key for new tickets
**Decision**: Before creating a new ticket (`PDCL-XXXX-*.yml`), the apply script searches JIRA for any issue in the project whose remote links include one with global ID `repo-{PR#}` (e.g. `repo-1553`). No pagination is needed — a single search suffices. If any match is found, creation is skipped and the found ticket key is returned. Apply exits 0 in either case, so the workflow continues with the delete-and-fetch step.  
**Rationale**: Using `repo-{PR#}` as the global ID gives JIRA a stable, indexed identifier that is more reliably searchable than a full URL. If the build fails mid-step and re-runs, apply again finds the link and returns the key; the XXXX file is re-deleted and fetch re-creates the real-key file — fully idempotent.

### `details` section is read-only metadata; refreshed by the build workflow
**Decision**: The `details` section is a read-only snapshot — the apply script ignores it entirely. After apply runs successfully, the build workflow deletes the file and calls fetch to regenerate `details` from live JIRA state, producing a fresh file with the real ticket key in the filename.  
**Rationale**: Prevents accidental JIRA drift from a stale snapshot. The post-apply fetch ensures `details` always reflects the true JIRA state after the updates have landed.

### New ticket file naming with `XXXX` sentinel
**Decision**: Unsubmitted tickets use `PDCL-XXXX-short-description.yml`. After apply creates the ticket (or finds an existing one via the remote-link check), the build workflow deletes the XXXX file and calls `fetch.mjs <real-key> <real-key-filename>` to create a properly-named file (e.g. `PDCL-1234-short-description.yml`) with populated `details`.  
**Rationale**: Deleting the XXXX file and creating a named file in a single skip-ci commit is idempotent: if the build fails and re-runs, apply finds the remote link, exits 0, and the delete+fetch sequence completes cleanly.

### Local `/jira-propose` makes zero JIRA calls
**Decision**: The propose action only reads `.jira/` files and git state. It never calls the JIRA API.  
**Rationale**: Developers may not have a JIRA PAT configured; the action should work offline and in CI lint passes. JIRA reads are deferred to the `details` snapshot (which can be populated manually or by a separate fetch script in future).

### Apply and fetch script location
**Decision**: `scripts/jira/apply.mjs` and `scripts/jira/fetch.mjs` — standalone Node.js ES modules.  
**Rationale**: Keeps CI logic in the same `scripts/` tree as the existing JIRA helpers, enabling code reuse from `scripts/team/config.js`.

### Fetch script design
**Decision**: `fetch.mjs` requires exactly two arguments: `<ticket-key>` and `<filename>`. Both are required. It calls JIRA's `GET /rest/api/2/issue/{key}` endpoint and writes (or overwrites) the file at the given path with a fresh `details` section; any existing `updates` array is preserved.  
**Rationale**: Keeping key and filename independent lets the build workflow substitute the real ticket number for XXXX in the filename, and lets LLMs or developers control naming. The script stays deterministic given the same inputs. Fetch can read any JIRA project (not limited to PDCL) since it is read-only.

### No separate JIRA workflow file
**Decision**: Integrate the `apply-jira` job into the existing `.github/workflows/version-and-publish.yml`.  
**Rationale**: Avoids proliferating workflow files. The apply job is a pure side-effect on merge to `main` — it belongs alongside other post-merge steps (publish, deploy, release notes). It runs independently of the changeset gate so it fires on every push to `main`, not just release pushes.

## Risks / Trade-offs

- **Build dies between apply and commit** → Mitigation: Idempotent by design — re-run finds the remote link, deletes the XXXX file again (or finds it already gone), and re-creates the real-key file via fetch. Git commit is a no-op if files haven't changed.
- **PAT expiry breaks apply workflow** → Mitigation: Workflow fails loudly with a clear error; no partial JIRA state written. Token rotation follows the existing `JIRA_API_TOKEN` ops pattern.
- **Large JIRA body fields (description)** → Mitigation: `details` snapshot truncates long string fields (> 500 chars) with a `...` suffix; full content lives in JIRA.
- **XXXX files from different PRs collide** → Each PR that creates a new ticket produces a distinct JIRA ticket with a distinct key. Concurrent XXXX files on concurrent PRs are fine — they will each create their own ticket once merged.

## Migration Plan

1. Add `.jira/` directory with a `.gitkeep` and README
2. Add `scripts/jira/fetch.mjs` — test locally against a real PDCL ticket with `--dry-run`
3. Add `scripts/jira/apply.mjs` — test locally with `--dry-run`
4. Add `apply-jira` job to `version-and-publish.yml`; coordinate its file additions/deletions with the existing changeset skip-ci commit so a single commit covers both; add `JIRA_API_TOKEN` secret to the `Production` environment
5. Add `.claude/skills/jira-propose/SKILL.md`
6. Create or update `CLAUDE.md` and the project README with the full workflow

Rollback: Remove the `apply-jira` job from the workflow. YAML files in `.jira/` are inert without the job.

## Resolved Questions

- **Should the apply workflow post a PR comment with JIRA links after applying?** Yes — add a step that posts a PR comment listing the JIRA tickets that were created or updated.
- **Should `details` be populated automatically by a fetch script when `/jira-propose` is run?** No — `/jira-propose` works locally only and assumes local ticket files are up-to-date. Developers run fetch manually if they need to refresh `details`.
