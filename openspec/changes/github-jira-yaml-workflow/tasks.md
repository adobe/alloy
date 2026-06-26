## 1. Scaffold `.jira/` Directory and Schema

- [x] 1.1 Create `.jira/` directory with a `.gitkeep` file; JIRA YAML files are tracked in version control
- [x] 1.2 Write a `.jira/README.md` documenting: file naming convention, YAML schema (`details` / `updates`), custom field reference (component IDs, issue type IDs, `customfield_23300`), and the expected end-to-end flow (propose skill → PR review → apply script → fetch script → build workflow commit)

## 2. Fetch Script (`scripts/jira/fetch.mjs`)

- [x] 2.1 Create `scripts/jira/fetch.mjs` as an ES module; require two positional args (`<ticket-key>` and `<filename>`), exit with usage message if either is missing; wire up `--dry-run` flag and `JIRA_API_TOKEN` guard
- [x] 2.2 Implement `GET /rest/api/2/issue/{key}` call (supports any JIRA project, not limited to PDCL); extract non-null fields into a `details` object; omit null/empty-array fields; truncate strings over 500 chars with `...`
- [x] 2.3 Implement file write logic: if file exists, replace only the `details` section and preserve `updates`; if new, create file with only `details` plus `# fetched from JIRA <timestamp>` comment
- [x] 2.4 Add `--dry-run` output: print target path and YAML content without writing or fetching

## 3. Apply Script (`scripts/jira/apply.mjs`)

- [x] 3.1 Create `scripts/jira/apply.mjs` as an ES module; require one positional `<filename>` argument; wire up `--dry-run` flag, `JIRA_API_TOKEN` guard, and `GITHUB_PR_URL`/`GITHUB_PR_TITLE`/`GITHUB_PR_NUMBER` env-var validation (required only when `updates` is non-empty)
- [x] 3.2 Implement ticket key resolution: parse `{PROJECT}-{NUMBER}` from filename; for `XXXX` files, search JIRA for any issue with a remote link whose global ID is `repo-{PR#}` (no pagination — a single search hit is sufficient); if found, use that ticket key and exit 0; if not found, proceed to create
- [x] 3.3 If the file has no `updates` or an empty array: print the resolved ticket key to stdout and exit 0 with no API calls
- [x] 3.4 Implement REST call executor: for each `updates` entry, serialize `body` from YAML to JSON and call JIRA API with `Authorization: Bearer`; fail fast on non-2xx
- [x] 3.5 Implement remote-link creation after all updates: POST to `/rest/api/2/issue/{key}/remotelink` with `url`, `title`, and `globalId: "repo-{PR#}"`; skip if global ID is already linked
- [x] 3.6 Print the resolved ticket key as the final stdout line (e.g. `PDCL-1234`)
- [x] 3.7 Add `--dry-run` output: print planned API calls and the resolved key without making HTTP requests
- [x] 3.8 Test locally against a real PDCL ticket using `--dry-run`

## 4. Build Workflow Integration (`.github/workflows/version-and-publish.yml`)

- [x] 4.1 Add a new `apply-jira` job to `version-and-publish.yml` that runs on every push to `main`; use `Production` environment for `JIRA_API_TOKEN` access
- [x] 4.2 Add step to extract `GITHUB_PR_NUMBER`, `GITHUB_PR_URL`, and `GITHUB_PR_TITLE` from the push event's associated PR via `gh pr list --merged`
- [x] 4.3 Add step to detect changed `.jira/*.yml` files via `git diff HEAD^1 HEAD --name-only -- '.jira/*.yml'`; skip remaining steps if none
- [x] 4.4 Add loop step: for each changed file that has an `updates` section, run `node scripts/jira/apply.mjs <file>`, capture the printed ticket key; on success, delete the file, derive the new real-key filename (replace `XXXX` with the ticket number), and run `node scripts/jira/fetch.mjs <key> <new-filename>`
- [x] 4.5 Add a step after apply-jira that posts a PR comment listing all JIRA tickets created or updated (using `gh pr comment`)
- [x] 4.6 Combine the `.jira/` file additions/deletions with any changeset version-bump changes into a single skip-ci commit; add this as a job step with appropriate `needs` dependencies so JIRA and changeset changes land together

## 5. `/jira-propose` Claude Code Skill

- [x] 5.1 Create `.claude/skills/jira-propose/SKILL.md` skill file with instructions for the propose action (skills can be invoked automatically by the agent; commands cannot)
- [x] 5.2 Implement logic to scan `.jira/*.yml` files and match against current git diff, branch name, and recent commit messages
- [x] 5.3 Implement new-ticket YAML generation: populate `summary`, `description` (including business value: customer names, who benefits, elevator-pitch value statement), `issuetype`, `project`, `components`, `customfield_23300` with defaults from `scripts/team/api.js` ISSUE_TEMPLATES; include inline YAML comments for custom fields
- [x] 5.4 Implement existing-ticket update: when a match is found, append or replace the `updates` array in the existing file
- [x] 5.5 Implement issue-type heuristic: default to `story` (id `7`); use `bug` (id `1`) when commit messages or diff context suggest a fix

## 6. Cleanup and Documentation

- [x] 6.1 Create `CLAUDE.md` if it does not exist, and update the project README, with the full `.jira/` workflow: propose → PR review → build applies → fetch refreshes
- [ ] 6.2 Add `JIRA_API_TOKEN` secret to the `Production` GitHub Actions environment
