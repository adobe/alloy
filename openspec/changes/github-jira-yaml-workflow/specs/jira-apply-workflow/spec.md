## ADDED Requirements

### Requirement: The existing build workflow gains an `apply-jira` job that runs on every push to `main`
`.github/workflows/version-and-publish.yml` SHALL include a new `apply-jira` job. The job SHALL run on every `push` to `main` (independently of the changeset gate used by the `publish` job). No separate workflow file is created.

#### Scenario: Job runs on every push to `main`, not only release pushes
- **WHEN** a PR with `.jira/*.yml` changes is merged and there is no pending changeset
- **THEN** the `apply-jira` job still runs

#### Scenario: Job exits early when no `.jira/*.yml` files changed in the push
- **WHEN** the merge commit contains no changes to `.jira/*.yml` files
- **THEN** the `apply-jira` job exits without making any JIRA API calls

### Requirement: The workflow discovers changed `.jira/` files and runs `process.js` on each
The `apply-jira` job SHALL detect which `.jira/*.yml` files changed in the merge commit using `git diff HEAD^1 HEAD --name-only`. For each changed file it SHALL run `node scripts/jira/process.js <filename>`, which internally handles apply, fetch, and filename rename. After all files are processed, it SHALL commit any changes to `.jira/` files back to `main` with `[skip ci]`.

#### Scenario: process.js runs for each changed file
- **WHEN** a PR merges that changed `PDCL-1234-my-feature.yml` and `PDCL-a3f8b2c1-new-ticket.yml`
- **THEN** the job runs `process.js` on each file independently

#### Scenario: New ticket file is renamed to real key after processing
- **WHEN** `process.js PDCL-a3f8b2c1-new-ticket.yml` creates ticket `PDCL-5678`
- **THEN** the placeholder file is deleted and `PDCL-5678-new-ticket.yml` is created with fresh `details`

#### Scenario: Updated details are committed back to main
- **WHEN** fetch refreshes one or more `.jira/` files with new `details` content
- **THEN** the job commits those changes to `main` with a `chore: refresh JIRA details [skip ci]` message

### Requirement: Apply script takes a single filename argument and prints the resolved ticket key to stdout
`scripts/jira/apply.js` SHALL accept one required positional argument: the path to a `.jira/*.yml` file. It SHALL print the resolved JIRA ticket key (e.g. `PDCL-1234`) to stdout as the final line of output.

For existing ticket files, the key is parsed from the filename. For new-ticket files (non-numeric key in filename), the key is obtained after label-based lookup or creation.

If the file has no `updates` key or an empty array, the script SHALL still return the ticket key and exit 0 without making any API calls.

#### Scenario: Ticket key printed to stdout for existing ticket
- **WHEN** `node scripts/jira/apply.js .jira/PDCL-1234-my-feature.yml` runs
- **THEN** `PDCL-1234` is the last line printed to stdout

#### Scenario: Real ticket key printed for new ticket
- **WHEN** `node scripts/jira/apply.js .jira/PDCL-a3f8b2c1-new-ticket.yml` runs and creates ticket `PDCL-5678`
- **THEN** `PDCL-5678` is the last line printed to stdout

#### Scenario: No-update file prints key without API calls
- **WHEN** a file has no `updates` array and `apply.js` is called on it
- **THEN** the script prints the ticket key and exits 0 with no JIRA API calls made

### Requirement: Apply script is idempotent for new ticket creation via JIRA label
Before creating a new ticket (file with a non-numeric globalId in the name), the apply script SHALL search JIRA for `project = {PROJECT} AND labels = "{globalId}"`. If a match is found, that ticket's key is used for all subsequent steps and the create call is skipped.

The globalId is embedded in the filename (e.g. `PDCL-a3f8b2c1-title.yml`) and MUST also appear in `labels` on the POST create body so that JIRA indexes it for lookup.

#### Scenario: Second run finds existing ticket by label and skips creation
- **WHEN** `apply.js` is called a second time for the same `PDCL-a3f8b2c1-*.yml` and a ticket with label `a3f8b2c1` already exists
- **THEN** the script uses the found ticket key, skips the create call, and prints the key to stdout

#### Scenario: No matching ticket found — ticket is created
- **WHEN** no JIRA ticket has the label matching the globalId
- **THEN** the apply script executes the POST create call and uses the returned key

### Requirement: Apply script auto-creates a JIRA remote link for every processed ticket
After executing all `updates`, the apply script SHALL POST to `/rest/api/2/issue/{key}/remotelink` using the PR URL as the `globalId` (idempotent — JIRA deduplicates by globalId). This happens for both new and existing tickets when `GITHUB_PR_URL` is set.

If `GITHUB_PR_URL` is not set (e.g., a direct commit to main with no associated PR), the remote link step is silently skipped and apply still exits 0.

No remotelink entry is required in the `.jira/` YAML file — the apply script adds it automatically.

#### Scenario: Remote link created after updates applied
- **WHEN** a `.jira/` file is processed and `GITHUB_PR_URL` is set
- **THEN** a remote link pointing to the PR is added to the JIRA ticket (idempotent via PR URL as globalId)

#### Scenario: No remote link when PR URL is absent
- **WHEN** `GITHUB_PR_URL` is not set (direct commit, no PR)
- **THEN** apply exits 0 and skips the remote link step without error

### Requirement: Apply script accepts PR context via environment variables
The apply script SHALL read `GITHUB_PR_URL` and `GITHUB_PR_TITLE` from the environment. Both are required only when the file has an `updates` array and `--dry-run` is not set. If either is missing when updates are present (and not in dry-run), the script SHALL exit with a clear error message and code 1.

#### Scenario: Missing PR URL causes exit when updates present (non-dry-run)
- **WHEN** `GITHUB_PR_URL` is not set and the file has updates and `--dry-run` is not passed
- **THEN** the script exits with code 1 and an error message

### Requirement: Apply script supports a `--dry-run` flag
When `--dry-run` is passed, the script SHALL log all planned non-GET API calls (method, path, JSON body) without making any mutating HTTP requests. Read-only requests (label search via `searchIssues`) SHALL still execute in dry-run to give an accurate preview of what ticket key would be resolved.

#### Scenario: Dry run logs planned mutating calls, executes reads
- **WHEN** `node scripts/jira/apply.js --dry-run .jira/PDCL-a3f8b2c1-foo.yml` is run
- **THEN** non-GET calls are printed with `[dry-run]` prefix and no HTTP mutations are made; the label search runs and may find an existing ticket

### Requirement: Apply script exits with a non-zero code on any API failure
If any JIRA REST call returns a non-2xx response, the apply script SHALL log the error and exit with code 1, causing the workflow job to fail.

#### Scenario: API error causes job failure
- **WHEN** a JIRA API call returns 4xx or 5xx
- **THEN** the script logs the status and response body, then exits with code 1

### Requirement: Apply script uses `JIRA_API_TOKEN` from the environment
The apply script SHALL read the bearer token from `JIRA_API_TOKEN`. If absent, it SHALL print `"JIRA_API_TOKEN is required"` and exit with code 1.

#### Scenario: Missing token causes early exit
- **WHEN** `JIRA_API_TOKEN` is not set
- **THEN** the script exits with code 1 before making any HTTP requests
