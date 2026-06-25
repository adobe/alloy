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

**Non-Goals:**
- Real-time JIRA → repo sync (the `details` snapshot is a one-time capture, not kept live)
- Automated backfill of historical tickets
- Support for JIRA projects other than PDCL (config is project-key-aware but multi-project support is not in scope)
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
**Decision**: Before creating a new ticket (`PDCL-XXXX-*.yml`), the apply script searches JIRA for any issue in the project with a remote link whose URL matches the PR URL. If found, the ticket already exists and creation is skipped.  
**Rationale**: `PDCL-XXXX` files have no real ticket key yet, so we need an external signal. GitHub PR URLs are stable and unique — a perfect idempotency key.

### `details` section is read-only metadata
**Decision**: The `details` section is a snapshot captured at propose time (or manually). The apply script ignores it entirely.  
**Rationale**: Prevents accidental JIRA drift if `details` gets stale. Updates are always expressed explicitly in `updates`.

### New ticket file naming with `XXXX` sentinel
**Decision**: Unsubmitted tickets use `PDCL-XXXX-short-description.yml`. After the apply workflow creates the ticket, the file is NOT automatically renamed (the real key appears in the JIRA remote link and in the workflow output log).  
**Rationale**: Renaming requires a follow-up commit; accepting a slightly stale filename is simpler and avoids merge conflicts. Teams can manually rename as a housekeeping step.

### Local `/jira-propose` makes zero JIRA calls
**Decision**: The propose action only reads `.jira/` files and git state. It never calls the JIRA API.  
**Rationale**: Developers may not have a JIRA PAT configured; the action should work offline and in CI lint passes. JIRA reads are deferred to the `details` snapshot (which can be populated manually or by a separate fetch script in future).

### Apply and fetch script location
**Decision**: `scripts/jira/apply.mjs` and `scripts/jira/fetch.mjs` — standalone Node.js ES modules.  
**Rationale**: Keeps CI logic in the same `scripts/` tree as the existing JIRA helpers, enabling code reuse from `scripts/team/config.js`.

### Fetch script design
**Decision**: `fetch.mjs` accepts a ticket key (e.g. `PDCL-1234`) or a `.jira/` filename, calls JIRA's `GET /rest/api/2/issue/{key}` endpoint, and writes (or updates) a `.jira/{key}-{slug}.yml` file. The slug is derived from the ticket summary. If the file already exists, only the `details` section is replaced; any `updates` array is preserved.  
**Rationale**: Lets developers bootstrap the `details` snapshot from a real ticket without copy-pasting from the JIRA UI. Can also be run in CI before apply to capture a before-snapshot for audit logs.

### No separate JIRA workflow file
**Decision**: Integrate the `apply-jira` job into the existing `.github/workflows/version-and-publish.yml`.  
**Rationale**: Avoids proliferating workflow files. The apply job is a pure side-effect on merge to `main` — it belongs alongside other post-merge steps (publish, deploy, release notes). It runs independently of the changeset gate so it fires on every push to `main`, not just release pushes.

## Risks / Trade-offs

- **Stale `details` snapshot** → Mitigation: `details` is advisory only; apply ignores it. Document this clearly in schema comments.
- **XXXX files never renamed** → Mitigation: Workflow output logs the real ticket key. A future housekeeping script can rename files post-merge.
- **JIRA API pagination on remote-link search** → Mitigation: Apply script iterates all pages when searching for an existing remote link before creating a new ticket.
- **PAT expiry breaks apply workflow** → Mitigation: Workflow fails loudly with a clear error; no partial state written. Token rotation is an ops concern (existing pattern for `JIRA_API_TOKEN` secret).
- **Concurrent PRs both creating the same PDCL-XXXX ticket** → Mitigation: Remote-link idempotency check handles this — whichever workflow runs second finds the link and skips creation.
- **Large JIRA body fields (description)** → Mitigation: `details` snapshot truncates long string fields (> 500 chars) with a `...` suffix; full content lives in JIRA.

## Migration Plan

1. Add `.jira/` directory with a `.gitkeep`
2. Add `scripts/jira/fetch.mjs` — test locally against a real PDCL ticket with `--dry-run`
3. Add `scripts/jira/apply.mjs` — test locally with `--dry-run`
4. Add `apply-jira` job to `version-and-publish.yml` referencing `JIRA_API_TOKEN` secret
5. Add `.claude/commands/jira-propose.md` skill
6. Remove (or archive to `scripts/legacy/`) `scripts/createJiraTicket.js` — the `scripts/team/` helpers are retained as shared utilities
7. Update `CLAUDE.md` / team docs with the new workflow

Rollback: Remove the `apply-jira` job from the workflow. YAML files in `.jira/` are inert without the job.

## Open Questions

- Should the apply workflow post a PR comment with JIRA links after applying? (Nice-to-have; out of scope for v1)
- Should `details` be populated automatically by a fetch script when `/jira-propose` is run against an existing ticket key? (Deferred; requires JIRA auth locally)
