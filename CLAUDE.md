# Alloy — Claude Code guide

## JIRA ticket management

JIRA changes are version-controlled as YAML files in `.jira/`. No JIRA API calls are made locally.

### Workflow

1. **Propose** — Run `/jira-propose` to create or update a `.jira/*.yml` file based on current git changes and context.
2. **Review** — The `.jira/` diff appears in the PR. Reviewers approve JIRA changes alongside code changes.
3. **Apply** — On merge to `main`, the `apply-jira` CI job executes each file's `updates` array against the JIRA REST API, creates a remote link back to the PR, and posts a PR comment listing updated tickets.
4. **Fetch** — After apply, the XXXX file is deleted and `fetch.js` writes a fresh file with the real ticket key and current JIRA state. A `[skip ci]` commit lands these changes.

### File naming

- Existing ticket: `PDCL-1234-short-title.yml`
- New ticket (not yet in JIRA): `PDCL-XXXX-short-description.yml`

### Scripts

```bash
# See planned JIRA calls without making them (safe for local use)
node scripts/jira/apply.js --dry-run .jira/PDCL-1234-my-feature.yml

# Fetch current JIRA state into a file
JIRA_API_TOKEN=<token> node scripts/jira/fetch.js PDCL-1234 .jira/PDCL-1234-my-feature.yml
```

### CI environment variables (Production GitHub Actions environment)

| Variable | Required for |
|----------|-------------|
| `JIRA_API_TOKEN` | apply.js and fetch.js API calls |
| `ALLOY_BOT_GITHUB_SSH_PRIVATE_KEY` | Pushing skip-ci commits to main |

### Custom fields (PDCL project)

| Field | Value |
|-------|-------|
| AEP Web SDK component | `components[].id: "155901"` |
| Product (`customfield_23300`) | `id: "116005"` |
| Story `issuetype.id` | `"7"` |
| Bug `issuetype.id` | `"1"` |

See [`.jira/README.md`](./.jira/README.md) for the full schema reference.
