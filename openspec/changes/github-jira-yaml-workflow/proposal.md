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
- `scripts/jira/apply.mjs <filename>` applies that file's `updates` to JIRA, creates a remote link to the PR (using `repo-{PR#}` as the remote link's global ID for reliable JIRA indexing), and prints the resolved ticket key (e.g. `PDCL-1234`) to stdout
- New tickets use `PDCL-XXXX-...` sentinel names; before creating, apply checks whether any JIRA issue already has a remote link with global ID `repo-{PR#}`; if found, the existing key is returned (no new ticket created); in either case the XXXX file is deleted and replaced by a real-key file via fetch
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
- New `.claude/skills/jira-propose/SKILL.md` skill definition (skills can be invoked by the agent automatically; commands cannot)
- A new quality gate in `.github/workflows/quality-checks.yml` verifies that every open PR has at least one `.jira/` YAML file, ensuring JIRA traceability for all changes
- `JIRA_API_TOKEN` secret will be added to the GitHub Actions `Production` environment
