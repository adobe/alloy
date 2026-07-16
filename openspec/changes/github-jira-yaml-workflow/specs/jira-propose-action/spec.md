## ADDED Requirements

### Requirement: `/jira-propose` creates or updates a `.jira/` YAML file locally without calling JIRA
The `/jira-propose` Claude Code skill SHALL operate entirely locally. It SHALL NOT make any calls to the JIRA REST API. All information used to populate a new ticket file comes from git state, chat context, and existing `.jira/` files.

#### Scenario: Propose runs without JIRA credentials
- **WHEN** a developer runs `/jira-propose` with no `JIRA_API_TOKEN` set
- **THEN** the command completes successfully and writes a `.jira/` YAML file

### Requirement: `/jira-propose` searches existing `.jira/` files for a matching ticket
When invoked, `/jira-propose` SHALL scan all `.jira/*.yml` files and compare their content (filename slug, `details.summary` if present) against the current git changes and chat context. If a suitable match is found, the command SHALL update the existing file. If no match is found, the command SHALL create a new `PDCL-{globalId}-<short-description>.yml` file.

#### Scenario: Matching ticket found
- **WHEN** an existing `.jira/PDCL-1234-my-feature.yml` matches the current changes
- **THEN** `/jira-propose` updates that file's `updates` section rather than creating a new file

#### Scenario: No matching ticket found
- **WHEN** no existing `.jira/` file matches the current changes
- **THEN** `/jira-propose` creates a new `PDCL-{globalId}-<short-description>.yml` with an `updates` array containing a create-ticket REST call

### Requirement: `/jira-propose` uses current git changes and chat context to populate the ticket
`/jira-propose` SHALL inspect:
- The current git diff (staged and unstaged changes) to infer what changed
- Recent commit messages on the branch
- Chat context provided by the user in the invocation or recent conversation

From this context it SHALL populate:
- `summary` (required): a concise one-line ticket title
- `description` (optional): a paragraph describing the change and motivation, including business value — specific customer names (if known from context or prior conversations), who benefits, why it matters, and the elevator-pitch value statement
- `issuetype`: defaulting to `story` (id `7`) unless the change is clearly a bug fix
- `components`: `[{ id: "155901" }]` (AEP Web SDK, matching existing defaults)
- `customfield_23300`: `{ id: "116005" }` (product field, matching existing defaults)

#### Scenario: Summary derived from commit messages
- **WHEN** the branch has commit messages describing a feature
- **THEN** the proposed ticket's `summary` reflects those commit messages

#### Scenario: Issue type defaults to story
- **WHEN** the change does not appear to be a bug fix
- **THEN** the proposed ticket uses `issuetype: { id: "7" }` (story)

#### Scenario: Issue type set to bug for fix changes
- **WHEN** commit messages or diff context indicate a bug fix
- **THEN** the proposed ticket uses `issuetype: { id: "1" }` (bug)

### Requirement: New ticket `updates` array uses globalId-in-labels for idempotency
For new tickets, the first entry in `updates` SHALL be a `POST /rest/api/2/issue` call whose body uses `fields` to set all initial field values. The `labels` field SHALL include the same `globalId` that appears in the filename — this is how the apply script finds an existing ticket on re-run without creating a duplicate.

No remotelink entry is needed in `updates` — `apply.js` creates the remote link to the PR automatically.

The `summary`, `issuetype`, `project`, `components`, `customfield_23300`, and `labels` fields SHALL always be present in the create body. The `description` field SHALL be included if non-empty.

#### Scenario: Create call is first in updates array with globalId in labels
- **WHEN** `/jira-propose` creates a new `PDCL-a3f8b2c1-*.yml` file
- **THEN** `updates[0]` is `{ path: "/rest/api/2/issue", method: "POST", body: { fields: { labels: ["a3f8b2c1"], ... } } }`

#### Scenario: No remotelink entry in updates
- **WHEN** the created file's `updates` array is inspected
- **THEN** there is no entry for `/rest/api/2/issue/{key}/remotelink`

#### Scenario: Create body includes required fields
- **WHEN** the created file's first update is inspected
- **THEN** it contains `project`, `issuetype`, `summary`, `components`, `customfield_23300`, and `labels` (with globalId)

### Requirement: YAML output includes inline comments for custom field IDs
The YAML files written by `/jira-propose` SHALL include inline comments explaining custom field IDs. See `.jira/README.md` for the full field reference.

Specifically:
- `customfield_23300` SHALL have the comment `# AEP Web SDK product field`
- Component IDs SHALL have comments identifying the component name (e.g. `# AEP Web SDK`, `# Documentation`)

#### Scenario: Custom field comment present in output
- **WHEN** `/jira-propose` writes a new ticket file
- **THEN** `customfield_23300` has an adjacent YAML comment identifying it

### Requirement: `/jira-propose` is implemented as a Claude Code skill in `.claude/skills/jira-propose/`
The action SHALL be implemented as a markdown skill file at `.claude/skills/jira-propose/SKILL.md`. Skills (unlike commands) can be invoked automatically by the agent in addition to being invoked manually by the developer.

#### Scenario: Skill is available in Claude Code
- **WHEN** a developer types `/jira-propose` in a Claude Code session
- **THEN** Claude Code loads and executes the skill from `.claude/skills/jira-propose/SKILL.md`

#### Scenario: Skill can be invoked automatically by the agent
- **WHEN** the Claude Code agent determines that a JIRA ticket file should be created or updated
- **THEN** the agent can invoke the skill without explicit developer input
