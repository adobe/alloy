## Why

The team's JIRA backlog management is disconnected from the codebase — ticket updates happen in the browser, making them invisible to code review, hard to audit, and impossible to automate. By representing JIRA changes as YAML files in the repo, every ticket update becomes a reviewable, version-controlled artifact that is applied deterministically when a PR merges, eliminating manual JIRA work and keeping the backlog in sync with shipped code.

## What Changes

- New `.jira/` directory at the repo root holds one YAML file per ticket (existing or new)
- YAML files follow the schema `{PROJECT}-{TICKET#}-short-title.yml` (e.g. `PDCL-1234-support-for-adcloud.yml`); new unsubmitted tickets use `PDCL-XXXX-short-description.yml`
- Each file has two optional top-level sections:
  - `details` — snapshot of the ticket's current non-null fields (read-only reference; not applied to JIRA)
  - `updates` — ordered array of idempotent REST calls (`path`, `method`, `body`) to apply when the PR merges
- YAML is used (not JSON) so inline comments can document custom field IDs (e.g. `customfield_23300`)
- The existing build workflow (`version-and-publish.yml`) gains a new `apply-jira` job: for each changed `.jira/*.yml` file that has an `updates` section, it runs `apply.mjs` → on success, deletes the file → runs `fetch.mjs` to create a fresh file at the real-key filename; all `.jira/` additions/deletions are committed in a single skip-ci commit alongside any changeset version bump
- `scripts/jira/apply.js <filename>` applies that file's `updates` to JIRA (interpolating `{GITHUB_PR_URL}` and `{GITHUB_PR_TITLE}` placeholders) and prints the resolved ticket key (e.g. `PDCL-1234`) to stdout; the remote link to the PR is an explicit entry in the `updates` array with a unique per-ticket `globalId`
- New tickets use `PDCL-XXXX-...` sentinel names; before creating, apply searches JIRA for any issue whose remote links already contain the ticket's unique `globalId`; if found, the existing key is returned (no new ticket created); in either case the XXXX file is deleted and replaced by a real-key file via fetch
- `scripts/jira/fetch.js <ticket-key> <filename>` fetches the current JIRA state for `<ticket-key>` and writes a fresh `details`-only snapshot to `<filename>` (no `updates` section); both arguments are required
- `scripts/jira/process.js <filename>` orchestrates apply + fetch for a single file; used by both the build workflow loop and as a CLI entry point
- A new `/jira-propose` Claude Code action inspects current git changes and chat context, searches `.jira/` for a matching ticket file, and creates one locally if none exists — **no JIRA API calls are made locally**
- Existing `scripts/createJiraTicket.js` and related scripts are superseded and will be removed; their field/template knowledge (project key, component IDs, custom fields) is migrated into the YAML schema and helper scripts

## Capabilities

### New Capabilities

- `jira-yaml-schema`: YAML file format and directory conventions for representing JIRA ticket state and pending updates
- `jira-apply-workflow`: Job added to the existing build workflow that applies `.jira/` YAML files to JIRA on every push to `main`, including remote-link creation and idempotency logic
- `jira-fetch-script`: `scripts/jira/fetch.js` that writes a fresh `details`-only snapshot from a live JIRA ticket; `scripts/jira/process.js` orchestrates apply + fetch together
- `jira-propose-action`: Claude Code `/jira-propose` slash command that creates or updates `.jira/` YAML files locally based on current changes — no JIRA API calls

### Modified Capabilities

## Impact

- New `.jira/` directory and files added to all PRs that touch JIRA tickets
- `.github/workflows/version-and-publish.yml` gains a new `apply-jira` job; no new workflow file is created
- New `scripts/jira/apply.js`, `scripts/jira/fetch.js`, `scripts/jira/api.js`, and `scripts/jira/process.js` Node.js scripts; all reuse `scripts/team/config.js` for base URL and project key
- Existing `scripts/createJiraTicket.js`, `scripts/openPr.js` JIRA fetch logic, and `scripts/team/` helpers referenced but some superseded
- New `.claude/skills/jira-propose/SKILL.md` skill definition (skills can be invoked by the agent automatically; commands cannot)
- `JIRA_API_TOKEN` secret will be added to the GitHub Actions `Production` environment
