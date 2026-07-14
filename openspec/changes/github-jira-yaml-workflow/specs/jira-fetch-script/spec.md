## ADDED Requirements

### Requirement: Fetch script requires both a ticket key and a filename as positional arguments
`scripts/jira/fetch.js` SHALL accept exactly two required positional arguments:
1. `<ticket-key>` — a JIRA issue key (e.g. `PDCL-1234`)
2. `<filename>` — the `.jira/` file to write (e.g. `.jira/PDCL-1234-my-feature.yml`)

If either argument is missing, the script SHALL print usage and exit with code 1.

The ticket key and filename are treated independently — the key is used to fetch from JIRA, and the filename determines where to write. This allows `process.js` to write to the correct real-key filename after ticket creation.

#### Scenario: Both arguments required
- **WHEN** the script is called with only one argument
- **THEN** it prints usage (`Usage: fetch.js <ticket-key> <filename>`) and exits with code 1

#### Scenario: Normal call for existing ticket
- **WHEN** called as `node scripts/jira/fetch.js PDCL-1234 .jira/PDCL-1234-my-feature.yml`
- **THEN** it fetches `PDCL-1234` from JIRA and writes to `.jira/PDCL-1234-my-feature.yml`

### Requirement: Fetch script populates the `details` section from live JIRA data
The fetch script SHALL call `GET /rest/api/2/issue/{key}` and extract all non-null fields from the response. It SHALL write these fields under the `details` key in the output YAML file.

Long string values (over 500 characters) SHALL be truncated to 500 characters with a `...` suffix. The file SHALL be annotated with a YAML comment (`# fetched from JIRA <timestamp>`) on the first line.

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

### Requirement: Fetch script completely overwrites the target file with only `details`
The fetch script SHALL overwrite the target file entirely with a fresh `details`-only section. Any existing `updates` array in the file SHALL be discarded.

This is by design: after `apply.js` has executed the updates, the updates are no longer pending — the refreshed file should be a clean snapshot of the current JIRA state. All file history is recoverable from git.

If the file does not exist, the script creates it with only a `details` section.

#### Scenario: Existing `updates` are clobbered
- **WHEN** `.jira/PDCL-1234-my-feature.yml` already exists with entries in `updates`
- **THEN** after running fetch, the file contains only a refreshed `details` section with no `updates` key

#### Scenario: New file created with only `details`
- **WHEN** no file exists at the given filename path
- **THEN** the script creates the file containing only a `details` section

### Requirement: Fetch script requires `JIRA_API_TOKEN` from the environment
The fetch script SHALL read the bearer token from `JIRA_API_TOKEN`. If absent, it SHALL print `"JIRA_API_TOKEN is required"` and exit with code 1.

#### Scenario: Missing token causes early exit
- **WHEN** `JIRA_API_TOKEN` is not set
- **THEN** the script exits with code 1 before making any HTTP request
