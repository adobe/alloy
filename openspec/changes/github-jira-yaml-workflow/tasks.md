## 1. Scaffold `.jira/` Directory and Schema

- [x] 1.1 Create `.jira/` directory with a `.gitkeep` file; JIRA YAML files are tracked in version control
- [x] 1.2 Write a `.jira/README.md` documenting: file naming convention, YAML schema (`details` / `updates`), custom field reference (component IDs, issue type IDs, `customfield_23300`), and the expected end-to-end flow (propose skill → PR review → apply script → fetch script → build workflow commit)

## 2. Fetch Script (`scripts/jira/fetch.js`)

- [x] 2.1 Create `scripts/jira/fetch.js` as an ES module; require two positional args (`<ticket-key>` and `<filename>`), exit with usage message if either is missing; wire up `--dry-run` flag and `JIRA_API_TOKEN` guard
- [x] 2.2 Implement `GET /rest/api/2/issue/{key}` call (supports any JIRA project, not limited to PDCL); extract non-null fields into a `details` object; omit null/empty-array fields; truncate strings over 500 chars with `...`
- [x] 2.3 Implement file write logic: overwrite the file with only `details` (no `updates` section) plus `# fetched from JIRA <timestamp>` comment; in `--dry-run` mode, fetch from JIRA and print the would-be content to stdout without writing
- [x] 2.4 Export `fetchFile` for use by `process.js`; script entry point only executes when run directly

## 3. Apply Script (`scripts/jira/apply.js`)

- [x] 3.1 Create `scripts/jira/apply.js` as an ES module; require one positional `<filename>` argument; wire up `--dry-run` flag, `JIRA_API_TOKEN` guard, and `GITHUB_PR_URL`/`GITHUB_PR_TITLE` env-var validation (required only when `updates` is non-empty and not in dry-run)
- [x] 3.2 Implement ticket key resolution: parse `{PROJECT}-{KEYPART}` from filename; if `KEYPART` is numeric, it's an existing ticket key; if non-numeric, it's a `globalId` for a new ticket — search `project = {PROJECT} AND labels = "{globalId}"` to find an existing ticket before creating
- [x] 3.3 If the file has no `updates` or an empty array: return the resolved ticket key with no API calls
- [x] 3.4 Implement update loop: for each entry in `updates`, POST to `/rest/api/2/issue` runs only when no ticket key is known yet (create); all other methods run only when a ticket key is known; use `eslint-disable-next-line no-await-in-loop` for intentionally sequential updates
- [x] 3.5 Auto-create a remote link from the ticket to the PR after processing all updates; use the PR URL as the remote link `globalId` (idempotent — JIRA deduplicates by globalId); no remotelink entry needed in the YAML
- [x] 3.6 Interpolate `{GITHUB_PR_URL}` and `{GITHUB_PR_TITLE}` placeholders in all `body` values before sending
- [x] 3.7 Add `--dry-run` output: log planned non-GET API calls without making mutating HTTP requests; label search (`searchIssues`) still runs in dry-run to give an accurate preview
- [x] 3.8 Export `applyFile` for use by `process.js`; script entry point only executes when run directly

## 3b. Config and API Factory

- [x] 3b.1 Create `scripts/jira/config.js` with `JIRA_BASE_URL` and `JIRA_API_TOKEN` from env; all jira scripts import from `./config.js` (not `../team/config.js`)
- [x] 3b.2 Create `scripts/jira/api.js` exporting a `createApi({ dryRun, baseUrl, token })` factory for dependency injection in tests; expose `request(method, path, body)` and `searchIssues(jql, opts)` — dryRun only blocks non-GET requests

## 3c. Process Orchestrator (`scripts/jira/process.js`)

- [x] 3c.1 Create `scripts/jira/process.js` that calls `applyFile` then `fetchFile` for a single `.jira/*.yml` file; handles globalId→real-key filename rename (deletes placeholder, creates new file); skips files with no updates; used by both the build workflow loop and as a CLI entry point
- [x] 3c.2 Export `processFile` for unit tests; vitest suite covers: no-updates skip, nonexistent file, existing ticket update, globalId→real-key rename

## 4. Build Workflow Integration (`.github/workflows/version-and-publish.yml`)

- [x] 4.1 Add a new `apply-jira` job to `version-and-publish.yml` that runs on every push to `main`; use `Production` environment for `JIRA_API_TOKEN` access
- [x] 4.2 Add step to extract `GITHUB_PR_URL` and `GITHUB_PR_TITLE` (not PR number) from the merged PR via `gh pr list --state merged`
- [x] 4.3 Add step to detect changed `.jira/*.yml` files via `git diff HEAD^1 HEAD --name-only -- '.jira/*.yml'`; skip remaining steps if none
- [x] 4.4 Add loop step: for each changed file, run `node scripts/jira/process.js "$file"` (which handles apply + fetch + globalId rename internally); capture printed ticket key
- [x] 4.5 Add a step after apply-jira that posts a PR comment listing all JIRA tickets created or updated (using `gh pr comment`)
- [x] 4.6 Add a commit step that stages all `.jira/` changes and commits with `[skip ci]`; the `publish` job declares `needs: [apply-jira]` so JIRA and changeset changes are coordinated

## 5. `/jira-propose` Claude Code Skill

- [x] 5.1 Create `.claude/skills/jira-propose/SKILL.md` skill file with instructions for the propose action (skills can be invoked automatically by the agent; commands cannot)
- [x] 5.2 Implement logic to scan `.jira/*.yml` files and match against current git diff, branch name, and recent commit messages
- [x] 5.3 Implement new-ticket YAML generation: populate `summary`, `description`, `issuetype`, `project`, `components`, `customfield_23300`; generate a unique 8-char hex `globalId` per ticket — placed in `labels` on the create body (enables idempotency lookup) and embedded in the filename; no remotelink entry needed in `updates` (apply adds it automatically)
- [x] 5.4 Implement existing-ticket update: when a match is found, append or replace the `updates` array in the existing file
- [x] 5.5 Implement issue-type heuristic: default to `story` (id `7`); use `bug` (id `1`) when commit messages or diff context suggest a fix

## 6. Cleanup and Documentation

- [x] 6.1 README updated with `.jira/` workflow overview; CLAUDE.md was created during review but subsequently removed per reviewer request (documentation lives in `.jira/README.md` and the skill file)
- [ ] 6.2 Add `JIRA_API_TOKEN` secret to the `Production` GitHub Actions environment
