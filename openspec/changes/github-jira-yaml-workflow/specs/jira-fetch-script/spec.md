## ADDED Requirements

### Requirement: Fetch script requires both a ticket key and a filename as positional arguments
`scripts/jira/fetch.mjs` SHALL accept exactly two required positional arguments:
1. `<ticket-key>` — a JIRA issue key (e.g. `PDCL-1234`)
2. `<filename>` — the `.jira/` file to write (e.g. `.jira/PDCL-1234-my-feature.yml` or `PDCL-XXXX-new-ticket.yml`)

If either argument is missing, the script SHALL print usage and exit with code 1.

The ticket key and filename are treated independently — the key is used to fetch from JIRA, and the filename determines where to write. This allows the caller to pass the real key alongside an `XXXX` filename (e.g. after `apply.mjs` creates a new ticket).

#### Scenario: Both arguments required
- **WHEN** the script is called with only one argument
- **THEN** it prints usage (`Usage: fetch.mjs <ticket-key> <filename>`) and exits with code 1

#### Scenario: Key and filename provided independently
- **WHEN** called as `node scripts/jira/fetch.mjs PDCL-1234 .jira/PDCL-XXXX-new-ticket.yml`
- **THEN** it fetches JIRA data for `PDCL-1234` and writes to `.jira/PDCL-XXXX-new-ticket.yml`

#### Scenario: Normal call for existing ticket
- **WHEN** called as `node scripts/jira/fetch.mjs PDCL-1234 .jira/PDCL-1234-my-feature.yml`
- **THEN** it fetches `PDCL-1234` from JIRA and updates `.jira/PDCL-1234-my-feature.yml`

### Requirement: Fetch script populates the `details` section from live JIRA data
The fetch script SHALL call `GET /rest/api/2/issue/{key}` and extract all non-null fields from the response. It SHALL write these fields under the `details` key in the output YAML file.

Long string values (over 500 characters) SHALL be truncated to 500 characters with a `...` suffix. The `details` section SHALL be annotated with a YAML comment (`# fetched from JIRA <timestamp>`) on the first line.

Fields with null or empty-array values SHALL be omitted from `details`.

#### Scenario: Non-null fields appear in `details`
- **WHEN** the fetch script runs against `PDCL-1234` which has a summary, status, assignee, and two components
- **THEN** all four fields appear under `details` in the output YAML

#### Scenario: Null fields are omitted
- **WHEN** a field in the JIRA response is null or an empty array
- **THEN** that field does not appear in the `details` section

#### Scenario: Long description is truncated
- **WHEN** the JIRA issue has a description longer than 500 characters
- **THEN** the `details.description` value is truncated to 500 characters followed by `...`

### Requirement: Fetch script preserves an existing `updates` section
If the target file already exists and contains an `updates` array, the fetch script SHALL overwrite only the `details` section and leave `updates` unchanged.

If the file does not exist, the script creates it with only a `details` section (no `updates` key).

#### Scenario: Existing `updates` are not clobbered
- **WHEN** `.jira/PDCL-1234-my-feature.yml` already exists with two entries in `updates`
- **THEN** after running fetch, the file still has those two `updates` entries unchanged, with a refreshed `details` section

#### Scenario: New file created with only `details`
- **WHEN** no file exists at the given filename path
- **THEN** the script creates the file containing only a `details` section

### Requirement: Fetch script supports a `--dry-run` flag
When `--dry-run` is passed, the script SHALL print the computed JIRA API URL and the YAML that would be written, without writing any files or making HTTP requests.

#### Scenario: Dry run prints planned output
- **WHEN** `node scripts/jira/fetch.mjs --dry-run PDCL-1234 .jira/PDCL-1234-foo.yml` is run
- **THEN** the target path and YAML content are printed to stdout and nothing is written

### Requirement: Fetch script requires `JIRA_API_TOKEN` from the environment
The fetch script SHALL read the bearer token from `JIRA_API_TOKEN`. If absent, it SHALL print `"JIRA_API_TOKEN is required"` and exit with code 1.

#### Scenario: Missing token causes early exit
- **WHEN** `JIRA_API_TOKEN` is not set
- **THEN** the script exits with code 1 before making any HTTP request
