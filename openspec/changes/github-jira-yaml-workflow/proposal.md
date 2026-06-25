## Why

The team's JIRA backlog management is disconnected from the codebase — ticket updates happen in the browser, making them invisible to code review, hard to audit, and impossible to automate. By representing JIRA changes as YAML files in the repo, every ticket update becomes a reviewable, version-controlled artifact that is applied deterministically when a PR merges, eliminating manual JIRA work and keeping the backlog in sync with shipped code.

## What Changes

- New `.jira/` directory at the repo root holds one YAML file per ticket (existing or new)
- YAML files follow the schema `{PROJECT}-{TICKET#}-short-title.yml` (e.g. `PDCL-1234-support-for-adcloud.yml`); new unsubmitted tickets use `PDCL-XXXX-short-description.yml`
- Each file has two optional top-level sections:
  - `details` — snapshot of the ticket's current non-null fields (read-only reference; not applied to JIRA)
  - `updates` — ordered array of idempotent REST calls (`path`, `method`, `body`) to apply when the PR merges
- YAML is used (not JSON) so inline comments can document custom field IDs (e.g. `customfield_23300`)
- The existing build workflow (`version-and-publish.yml`) gains a new `apply-jira` job that runs on every push to `main`; it detects which `.jira/*.yml` files changed in the merge, then for each file runs `apply.mjs` → captures the returned ticket key → runs `fetch.mjs` to refresh `details` → commits the updated files back to `main`
- `scripts/jira/apply.mjs <filename>` applies that file's `updates` to JIRA, creates a remote link to the PR, and prints the resolved ticket key (e.g. `PDCL-1234`) to stdout; the remote link doubles as the idempotency key for new ticket creation
- New tickets use `PDCL-XXXX-...` sentinel names; the apply script searches for an existing remote link matching the PR URL before creating, ensuring idempotency if the job re-runs
- `scripts/jira/fetch.mjs <ticket-key> <filename>` fetches the current JIRA state for `<ticket-key>` and writes it into the `details` section of `<filename>`, preserving any existing `updates` array; both arguments are required
- A new `/jira-propose` Claude Code action inspects current git changes and chat context, searches `.jira/` for a matching ticket file, and creates one locally if none exists — **no JIRA API calls are made locally**
- Existing `scripts/createJiraTicket.js` and related scripts are superseded and will be removed; their field/template knowledge (project key, component IDs, custom fields) is migrated into the YAML schema and helper scripts

## Capabilities

### New Capabilities

- `jira-yaml-schema`: YAML file format and directory conventions for representing JIRA ticket state and pending updates
- `jira-apply-workflow`: Job added to the existing build workflow that applies `.jira/` YAML files to JIRA on every push to `main`, including remote-link creation and idempotency logic
- `jira-fetch-script`: `scripts/jira/fetch.mjs` that generates or updates a `.jira/` YAML file's `details` section from a live JIRA ticket, preserving any existing `updates`
- `jira-propose-action`: Claude Code `/jira-propose` slash command that creates or updates `.jira/` YAML files locally based on current changes — no JIRA API calls

### Modified Capabilities

## Impact

- New `.jira/` directory and files added to all PRs that touch JIRA tickets
- `.github/workflows/version-and-publish.yml` gains a new `apply-jira` job; no new workflow file is created
- New `scripts/jira/apply.mjs` and `scripts/jira/fetch.mjs` Node.js scripts; both reuse `scripts/team/config.js` for base URL and project key
- Existing `scripts/createJiraTicket.js`, `scripts/openPr.js` JIRA fetch logic, and `scripts/team/` helpers referenced but some superseded
- New `.claude/commands/jira-propose.md` skill definition
- `JIRA_API_TOKEN` secret must be available in the GitHub Actions `Production` environment (already used by existing workflows)
