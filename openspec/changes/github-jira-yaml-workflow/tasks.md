## 1. Scaffold `.jira/` Directory and Schema

- [ ] 1.1 Create `.jira/` directory with a `.gitkeep` file
- [ ] 1.2 Write a `.jira/README.md` documenting the file naming convention, YAML schema (`details` / `updates`), and custom field reference (component IDs, issue type IDs, `customfield_23300`)
- [ ] 1.3 Add `.jira/*.yml` to `.gitignore` exclusions if needed (confirm it should be tracked)

## 2. Fetch Script (`scripts/jira/fetch.mjs`)

- [ ] 2.1 Create `scripts/jira/fetch.mjs` as an ES module; require two positional args (`<ticket-key>` and `<filename>`), exit with usage message if either is missing; wire up `--dry-run` flag and `JIRA_API_TOKEN` guard
- [ ] 2.2 Implement `GET /rest/api/2/issue/{key}` call; extract non-null fields into a `details` object; omit null/empty-array fields; truncate strings over 500 chars with `...`
- [ ] 2.3 Implement file write logic: if file exists, replace only the `details` section and preserve `updates`; if new, create file with only `details` plus `# fetched from JIRA <timestamp>` comment
- [ ] 2.4 Add `--dry-run` output: print target path and YAML content without writing or fetching

## 3. Apply Script (`scripts/jira/apply.mjs`)

- [ ] 3.1 Create `scripts/jira/apply.mjs` as an ES module; require one positional `<filename>` argument; wire up `--dry-run` flag, `JIRA_API_TOKEN` guard, and `GITHUB_PR_URL`/`GITHUB_PR_TITLE` env-var validation (required only when `updates` is non-empty)
- [ ] 3.2 Implement ticket key resolution: parse `{PROJECT}-{NUMBER}` from filename; for `XXXX` files, run the idempotency check (search all issues for a remote link matching `GITHUB_PR_URL`, handle pagination) to get the real key
- [ ] 3.3 If the file has no `updates` or an empty array: print the resolved ticket key to stdout and exit 0 with no API calls
- [ ] 3.4 Implement REST call executor: for each `updates` entry, serialize `body` from YAML to JSON and call JIRA API with `Authorization: Bearer`; fail fast on non-2xx
- [ ] 3.5 Implement remote-link creation after all updates: POST to `/rest/api/2/issue/{key}/remotelink` with `GITHUB_PR_URL` and `GITHUB_PR_TITLE`; skip if the URL is already linked
- [ ] 3.6 Print the resolved ticket key as the final stdout line (e.g. `PDCL-1234`)
- [ ] 3.7 Add `--dry-run` output: print planned API calls and the resolved key without making HTTP requests
- [ ] 3.8 Test locally against a real PDCL ticket using `--dry-run`

## 4. Build Workflow Integration (`.github/workflows/version-and-publish.yml`)

- [ ] 4.1 Add a new `apply-jira` job to `version-and-publish.yml` that runs on every push to `main` with no `needs` dependency on the changeset gate; use `Production` environment for `JIRA_API_TOKEN` access
- [ ] 4.2 Add step to extract `GITHUB_PR_URL` and `GITHUB_PR_TITLE` from the push event's associated PR via `GITHUB_EVENT_PATH` (the `head_commit` or via `gh pr list --merged`)
- [ ] 4.3 Add step to detect changed `.jira/*.yml` files via `git diff HEAD^1 HEAD --name-only -- '.jira/*.yml'`; skip remaining steps if none
- [ ] 4.4 Add loop step: for each changed file, run `node scripts/jira/apply.mjs <file>`, capture the printed ticket key, then run `node scripts/jira/fetch.mjs <key> <file>`
- [ ] 4.5 Add step to commit any updated `.jira/` files back to `main` with message `chore: refresh JIRA details [skip ci]` (skip commit if no changes)

## 5. `/jira-propose` Claude Code Skill

- [ ] 5.1 Create `.claude/commands/jira-propose.md` skill file with instructions for the propose action
- [ ] 5.2 Implement logic to scan `.jira/*.yml` files and match against current git diff, branch name, and recent commit messages
- [ ] 5.3 Implement new-ticket YAML generation: populate `summary`, `description`, `issuetype`, `project`, `components`, `customfield_23300` with defaults from `scripts/team/api.js` ISSUE_TEMPLATES; include inline YAML comments for custom fields
- [ ] 5.4 Implement existing-ticket update: when a match is found, append or replace the `updates` array in the existing file
- [ ] 5.5 Implement issue-type heuristic: default to `story` (id `7`); use `bug` (id `1`) when commit messages or diff context suggest a fix

## 6. Cleanup and Documentation

- [ ] 6.1 Move `scripts/createJiraTicket.js` to `scripts/legacy/createJiraTicket.js` (or delete if team confirms it was never used)
- [ ] 6.2 Update `CLAUDE.md` (or project README) with the new `.jira/` workflow: how to propose, fetch, and apply; how the build integration works
- [ ] 6.3 Verify the `JIRA_API_TOKEN` secret is available in the `Production` GitHub Actions environment
