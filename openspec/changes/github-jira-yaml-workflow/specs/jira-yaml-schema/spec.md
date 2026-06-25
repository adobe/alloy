## ADDED Requirements

### Requirement: Ticket files live in `.jira/` with a defined naming convention
All JIRA ticket files SHALL be stored in a `.jira/` directory at the repository root.

Existing ticket files SHALL be named `{PROJECT}-{TICKET#}-{short-title}.yml` (e.g. `PDCL-1234-support-for-adcloud.yml`).

New tickets not yet created in JIRA SHALL be named `{PROJECT}-XXXX-{short-description}.yml` (e.g. `PDCL-XXXX-add-identity-map-support.yml`). The `XXXX` sentinel signals that no real ticket key has been assigned yet.

Short titles and descriptions SHALL use kebab-case and be 3–6 words.

#### Scenario: Existing ticket file naming
- **WHEN** a developer creates a `.jira/` file for an existing JIRA ticket `PDCL-1234`
- **THEN** the file is named `PDCL-1234-<short-title>.yml` and resides at `.jira/PDCL-1234-<short-title>.yml`

#### Scenario: New ticket file naming
- **WHEN** a developer creates a `.jira/` file for a ticket not yet in JIRA
- **THEN** the file is named `PDCL-XXXX-<short-description>.yml` with the `XXXX` sentinel

### Requirement: YAML file structure with `details` and `updates` sections
Each ticket file SHALL be valid YAML. The file MAY contain two top-level keys: `details` and `updates`.

`details` SHALL contain a snapshot of the ticket's current non-null fields as they appear in JIRA, with long string values truncated to 500 characters followed by `...`. The `details` section is for human reference only and SHALL NOT be applied to JIRA by the apply script.

`updates` SHALL be an ordered array of REST call objects. Each object SHALL have the fields:
- `path` (string): JIRA REST API path, e.g. `/rest/api/2/issue/PDCL-1234`
- `method` (string): HTTP method, e.g. `PUT`, `POST`
- `body` (object): Request body; YAML object converted to JSON before sending

For new tickets (XXXX), the `details` key SHALL be absent.
For existing tickets with no pending changes, the `updates` key SHALL be absent.

YAML comments (`#`) SHALL be used freely to document custom field IDs and their meanings.

#### Scenario: File for existing ticket with updates
- **WHEN** a file `PDCL-1234-my-feature.yml` is opened
- **THEN** it contains a `details` map with current ticket fields and an `updates` array with REST call objects

#### Scenario: File for new ticket
- **WHEN** a file `PDCL-XXXX-new-feature.yml` is opened
- **THEN** it contains only an `updates` array (no `details` key); the first update is a POST to create the ticket

#### Scenario: File for existing ticket with no changes
- **WHEN** a file `PDCL-5678-reference-only.yml` is opened
- **THEN** it contains only a `details` map and no `updates` key

### Requirement: `updates` entries use idempotent `set` operations
All field updates within `updates[*].body` SHALL use the JIRA `update` object with `set` operations, never `add` or `remove`, so that re-applying the same file produces the same JIRA state.

#### Scenario: Field update is idempotent
- **WHEN** the apply script sends the same `updates` array twice to JIRA
- **THEN** the JIRA ticket state after both runs is identical and no duplicate data is created

#### Scenario: Correct update body structure
- **WHEN** a developer writes an update to change the `status` field
- **THEN** the body uses `{ "update": { "fieldName": [{ "set": <value> }] } }` or the equivalent direct PUT payload — never `add`/`remove` operations

### Requirement: YAML bodies are converted to JSON before sending to JIRA
The apply script SHALL parse each `updates[*].body` as a YAML object and serialize it to JSON before including it in the HTTP request body.

#### Scenario: YAML comments do not appear in JSON output
- **WHEN** a YAML body contains inline comments (e.g. `# AEP Web SDK product field`)
- **THEN** the JSON payload sent to JIRA contains no comment text
