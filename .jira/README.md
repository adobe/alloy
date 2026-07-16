# .jira/ — Version-controlled JIRA ticket management

YAML files in this directory represent pending JIRA changes. When a PR merges, the build workflow applies each file to JIRA and replaces it with a refreshed snapshot.

## File naming convention

| File type | Name format | Example |
|-----------|-------------|---------|
| Existing ticket | `{PROJECT}-{TICKET#}-{short-title}.yml` | `PDCL-1234-support-for-adcloud.yml` |
| New ticket (not yet in JIRA) | `{PROJECT}-XXXX-{short-description}.yml` | `PDCL-XXXX-add-identity-map-support.yml` |

Short titles and descriptions use kebab-case, 3–6 words.

## YAML schema

```yaml
# Optional read-only snapshot of the ticket's current JIRA state.
# Populated by fetch.mjs; ignored by apply.mjs.
details:
  key: PDCL-1234
  summary: Support for AdCloud
  status: { name: "In Progress" }
  # ... other non-null fields from JIRA

# Optional ordered array of idempotent REST calls to apply on merge.
# Omit if there are no pending changes.
updates:
  - path: /rest/api/2/issue/PDCL-1234
    method: PUT
    body:
      update:
        summary:
          - set: "Updated title"
        customfield_23300:  # AEP Web SDK product field
          - set: { id: "116005" }
```

### `details` section

- Written by `fetch.mjs`; never modified manually
- Read-only snapshot; apply.mjs ignores it entirely
- Null and empty-array fields are omitted
- String fields longer than 500 chars are truncated with `...`

### `updates` section

- Ordered array of `{ path, method, body }` REST call objects
- `body` is YAML and is serialized to JSON before sending to JIRA
- All field updates must use `set` operations (never `add`/`remove`) to ensure idempotency
- For new tickets: first entry is a `POST /rest/api/2/issue` with `fields` (not `update`)
- Absent or empty `updates` → apply.mjs prints the key and exits 0 without any API calls

## Custom field reference (PDCL project)

| Field | ID | Value |
|-------|----|-------|
| AEP Web SDK component | `components[].id` | `"155901"` |
| Documentation component | `components[].id` | `"157512"` |
| AEP Web SDK product (`customfield_23300`) | `id` | `"116005"` |
| Issue type: Story | `issuetype.id` | `"7"` |
| Issue type: Bug | `issuetype.id` | `"1"` |
| Issue type: Documentation | `issuetype.id` | `"14801"` |

## End-to-end flow

```
Developer                        CI (on merge to main)
─────────                        ─────────────────────
/jira-propose              →     apply.mjs <file>
  ↓ writes .jira/*.yml           ↓ calls JIRA REST API
PR review                        ↓ creates remote link (repo-{PR#})
  ↓ approves JIRA changes        delete file
Merge PR                         fetch.mjs <key> <new-file>
                                 ↓ writes refreshed details
                                 skip-ci commit
```

1. **Propose** — Run `/jira-propose` in Claude Code. Reads git diff and context, creates or updates a `.jira/*.yml` file locally. No JIRA API calls.
2. **Review** — The `.jira/` file diff appears in the PR. Reviewers can inspect and amend JIRA changes before they land.
3. **Apply** — On merge, `apply.mjs` executes each `updates` entry in order. For new (`XXXX`) tickets it creates the ticket first (idempotent: checks whether a remote link with `globalId: repo-{PR#}` already exists).
4. **Fetch** — After apply succeeds, the XXXX file is deleted and `fetch.mjs` writes a fresh file named with the real ticket key. A `[skip ci]` commit lands both JIRA and changeset changes.

## Scripts

```bash
# Apply a ticket file's updates to JIRA (CI usage)
JIRA_API_TOKEN=... GITHUB_PR_URL=... GITHUB_PR_TITLE=... \
  node scripts/jira/apply.mjs .jira/PDCL-1234-my-feature.yml

# Dry-run: see planned API calls without making them
node scripts/jira/apply.mjs --dry-run .jira/PDCL-1234-my-feature.yml

# Fetch current JIRA state into a file
JIRA_API_TOKEN=... node scripts/jira/fetch.mjs PDCL-1234 .jira/PDCL-1234-my-feature.yml

# Dry-run: see what would be written
node scripts/jira/fetch.mjs --dry-run PDCL-1234 .jira/PDCL-1234-my-feature.yml
```
