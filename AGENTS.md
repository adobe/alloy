## Agent skills

### Issue tracker

Work is tracked in Jira project PDCL (component `AEP Web SDK`); every PR needs a ticket. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five triage roles, applied as Jira labels with the same names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.

## GitHub CLI

Run every `gh` command for this repo with the token of the logged-in github.com account whose login does **not** end in `_adobe`. Logins ending in `_adobe` are corporate Enterprise Managed User accounts. They can read `adobe/alloy`, but writes such as `gh pr create` fail with "As an Enterprise Managed User, you cannot access this content".

Set the token on each command, which leaves the user's active `gh` account unchanged:

```sh
GH_USER=$(gh auth status --hostname github.com --json hosts \
  --jq 'first(.hosts["github.com"][] | select(.login | endswith("_adobe") | not) | .login)')
GH_TOKEN=$(gh auth token --hostname github.com --user "$GH_USER") gh pr create ...
```

If `GH_USER` comes back empty, ask the user to log in to that account with `gh auth login`.
