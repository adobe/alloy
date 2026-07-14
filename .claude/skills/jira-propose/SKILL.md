# /jira-propose — Propose JIRA ticket changes locally

Create or update a `.jira/*.yml` file to represent a JIRA ticket change. This skill operates **entirely locally** — no JIRA API calls are made. The resulting file is committed as part of a PR and applied to JIRA automatically when the PR merges.

## When to invoke

Invoke `/jira-propose` when:
- A feature, bug fix, or improvement is being built and should be tracked in JIRA
- An existing JIRA ticket needs updates (status, components, description, etc.)
- The user explicitly asks to propose a JIRA ticket for the current work

## Steps

### 1. Gather context

Run these commands in parallel to understand the current work:

```bash
git diff --stat HEAD
git log --oneline -10
git branch --show-current
ls .jira/*.yml 2>/dev/null || echo "(no existing jira files)"
```

Also read any `.jira/*.yml` files that exist, to check for matches.

### 2. Determine issue type

Default to **story** (`id: "7"`). Use **bug** (`id: "1"`) when:
- Branch name contains `fix`, `bug`, `hotfix`, or `patch`
- Commit messages contain `fix:`, `bug:`, `fixes`, `closes`, or `regression`
- The diff clearly addresses a defect rather than adding capability

### 3. Search for a matching existing ticket

Check each `.jira/*.yml` file:
- Compare the filename slug against the branch name and commit messages
- Compare `details.summary` (if present) against the likely ticket title
- If a file matches the current work, **update it** (append to `updates` array)
- If no file matches, **create a new one**

### 4a. New ticket — write `PDCL-<globalId>-<short-description>.yml`

Generate a short random `globalId` (8 hex characters, e.g. `"a3f8b2c1"`) and a kebab-case short description (3–6 words) from the branch name and commits.

Write `.jira/PDCL-<globalId>-<short-description>.yml` with this structure:

```yaml
updates:
  - path: /rest/api/2/issue
    method: POST
    body:
      fields:
        project:
          key: PDCL
        issuetype:
          id: "7"  # Story (use "1" for Bug, "14801" for Documentation)
        summary: <concise one-line ticket title>
        description: |
          <paragraph describing the change, motivation, and business value.
          Include: customer names or personas who benefit, what problem this solves,
          and the elevator-pitch value statement — why this matters to the product.>
        components:
          - id: "155901"  # AEP Web SDK
        customfield_23300:  # AEP Web SDK product field
          id: "116005"
        labels:
          - <globalId>  # idempotency key — do not remove
```

**Filename and globalId:**
- The `<globalId>` in the filename is the idempotency key for this ticket
- It must be unique per ticket file so multiple new tickets can be created in a single PR
- Generate a random 8-character hex string (e.g. `a3f8b2c1`)
- The same value goes in `labels` so `apply.js` can find the ticket on re-runs
- The apply script auto-creates a remote link from the ticket to the PR — no remotelink entry needed in `updates`
- After merge, the build replaces the file with `PDCL-<real-number>-<short-description>.yml`

**Description guidelines:**
- Lead with who benefits — use specific customer names if you know them from context or prior conversations (e.g., "Adobe Analytics customers at Marriott and Delta..." rather than just "Analytics customers...")
- Explain the problem being solved
- State the business value / outcome (e.g., "This eliminates the need for manual re-configuration after...")
- Keep to 2–4 sentences

### 4b. Existing ticket — update `updates` array

When a matching file is found, append (or replace if same operation exists) to the `updates` array:

```yaml
updates:
  - path: /rest/api/2/issue/{key}
    method: PUT
    body:
      update:
        summary:
          - set: <new summary>
        # Add other fields as needed; always use "set", never "add"/"remove"
```

Use `PUT /rest/api/2/issue/{key}` with `update.field[].set` for field changes.
Use `POST /rest/api/2/issue/{key}/transitions` for status transitions.
The `{key}` placeholder is replaced with the real ticket key by `apply.js` at run time.

### 5. Write the file

- Place it in `.jira/` at the repo root
- Use YAML comments (`#`) to document custom field IDs inline
- Verify the YAML is valid before finishing

### 6. Report back

After writing the file, tell the user:
- The filename created or updated
- The ticket identifier (globalId for new tickets, PDCL-NNNN for existing)
- The proposed summary
- What will happen when the PR merges (apply.js will execute the updates, then replace the file with a real-key filename)

## Reference

See [`.jira/README.md`](../../../.jira/README.md) for the full custom field reference (project key, component IDs, issue type IDs, JIRA base URL, and example YAML).

## Constraints

- **No JIRA API calls** — all information comes from git state, context, and existing `.jira/` files
- All `update` operations must use `set` (never `add`/`remove`) to ensure idempotency
- New tickets must have a `POST /rest/api/2/issue` as the first entry in `updates`, with the `globalId` in `labels`
- Do **not** add a remotelink entry to `updates` — the apply script creates it automatically
- File must be valid YAML
- Do not populate the `details` section — that is written by `fetch.js` after apply
