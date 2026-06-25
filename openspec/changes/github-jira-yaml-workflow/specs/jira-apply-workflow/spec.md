## ADDED Requirements

### Requirement: The existing build workflow gains an `apply-jira` job that runs on every push to `main`
`.github/workflows/version-and-publish.yml` SHALL include a new `apply-jira` job. The job SHALL run on every `push` to `main` (independently of the changeset gate used by the `publish` job). No separate workflow file is created.

#### Scenario: Job runs on every push to `main`, not only release pushes
- **WHEN** a PR with `.jira/*.yml` changes is merged and there is no pending changeset
- **THEN** the `apply-jira` job still runs

#### Scenario: Job exits early when no `.jira/*.yml` files changed in the push
- **WHEN** the merge commit contains no changes to `.jira/*.yml` files
- **THEN** the `apply-jira` job exits without making any JIRA API calls

### Requirement: The workflow discovers changed `.jira/` files from the merge and runs apply then fetch on each
The `apply-jira` job SHALL detect which `.jira/*.yml` files changed in the merge commit using `git diff HEAD^1 HEAD --name-only`. For each changed file it SHALL:
1. Run `node scripts/jira/apply.mjs <filename>` and capture the ticket key printed to stdout
2. Run `node scripts/jira/fetch.mjs <ticket-key> <filename>` to refresh `details` with post-apply JIRA state
3. After all files are processed, commit any changes to `.jira/` files back to `main` with `[skip ci]`

#### Scenario: apply then fetch run for each changed file
- **WHEN** a PR merges that changed `PDCL-1234-my-feature.yml` and `PDCL-XXXX-new-ticket.yml`
- **THEN** the job runs `apply.mjs` then `fetch.mjs` on each file independently

#### Scenario: Ticket key from apply is passed to fetch
- **WHEN** `apply.mjs PDCL-XXXX-new-ticket.yml` prints `PDCL-5678` to stdout (the newly created ticket key)
- **THEN** the job calls `fetch.mjs PDCL-5678 PDCL-XXXX-new-ticket.yml`

#### Scenario: Updated details are committed back to main
- **WHEN** fetch refreshes one or more `.jira/` files with new `details` content
- **THEN** the job commits those changes to `main` with a `chore: refresh JIRA details [skip ci]` message

### Requirement: Apply script takes a single filename argument and prints the resolved ticket key to stdout
`scripts/jira/apply.mjs` SHALL accept one required positional argument: the path to a `.jira/*.yml` file. It SHALL print the resolved JIRA ticket key (e.g. `PDCL-1234`) to stdout as the final line of output, so the calling script can capture it.

For existing ticket files, the key is parsed from the filename. For `XXXX` files, the key is the real ticket key obtained after creation (or discovered via idempotency check).

If the file has no `updates` key or an empty array, the script SHALL still print the ticket key and exit 0 without making any API calls.

#### Scenario: Ticket key printed to stdout for existing ticket
- **WHEN** `node scripts/jira/apply.mjs .jira/PDCL-1234-my-feature.yml` runs
- **THEN** `PDCL-1234` is the last line printed to stdout

#### Scenario: Real ticket key printed for new ticket
- **WHEN** `node scripts/jira/apply.mjs .jira/PDCL-XXXX-new-ticket.yml` runs and creates ticket `PDCL-5678`
- **THEN** `PDCL-5678` is the last line printed to stdout

#### Scenario: No-update file prints key without API calls
- **WHEN** a file has no `updates` array and `apply.mjs` is called on it
- **THEN** the script prints the ticket key and exits 0 with no JIRA API calls made

### Requirement: Apply script is idempotent for new ticket creation
Before creating a new ticket (file with `XXXX` in the name), the apply script SHALL search JIRA for any issue in the project with a remote link whose URL exactly matches `GITHUB_PR_URL`. If found, that ticket's key is used for all subsequent steps. The search SHALL handle JIRA API pagination.

#### Scenario: Second run finds existing remote link and skips creation
- **WHEN** `apply.mjs` is called a second time for the same `PDCL-XXXX-*.yml` and the PR's remote link already exists
- **THEN** the script uses the found ticket key, skips the create call, and prints the key to stdout

#### Scenario: No existing remote link — ticket is created
- **WHEN** no remote link matching `GITHUB_PR_URL` exists in the project
- **THEN** the apply script executes the create-ticket REST call and uses the returned key

### Requirement: Apply script creates a JIRA remote link for every processed ticket that has updates
After applying all `updates` for a ticket, the apply script SHALL POST to `/rest/api/2/issue/{key}/remotelink` with:
- `url`: the value of `GITHUB_PR_URL`
- `title`: the value of `GITHUB_PR_TITLE`
- `relationship`: `"mentioned in"`

If a remote link with the same URL already exists on the ticket, the script SHALL skip link creation.

Files with no `updates` array SHALL NOT have a remote link created.

#### Scenario: Remote link created after updates applied
- **WHEN** a `.jira/` file with a non-empty `updates` array is processed
- **THEN** a remote link pointing to the merged PR is added to the JIRA ticket

#### Scenario: Remote link skipped for no-update files
- **WHEN** a `.jira/` file has no `updates` key
- **THEN** no remote link is created

### Requirement: Apply script accepts PR context via environment variables
The apply script SHALL read `GITHUB_PR_URL` and `GITHUB_PR_TITLE` from the environment. Both are required when the file has an `updates` array. If either is missing when updates are present, the script SHALL exit with a clear error message and code 1.

#### Scenario: Missing PR URL causes exit when updates present
- **WHEN** `GITHUB_PR_URL` is not set and the file has updates
- **THEN** the script exits with code 1 and an error message

### Requirement: Apply script supports a `--dry-run` flag
When `--dry-run` is passed, the script SHALL print all planned API calls (method, path, JSON body) and the ticket key to stdout without making any HTTP requests.

#### Scenario: Dry run prints planned calls and key
- **WHEN** `node scripts/jira/apply.mjs --dry-run .jira/PDCL-1234-foo.yml` is run
- **THEN** all planned JIRA calls are printed and `PDCL-1234` is the last line, with no HTTP requests made

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
