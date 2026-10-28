# Issue tracker: Jira (PDCL)

Every change to alloy is tracked as a ticket in the **PDCL** Jira project (https://jira.corp.adobe.com/browse/PDCL). GitHub Issues on `adobe/alloy` are a public channel for customer reports, not the work tracker. Never create GitHub issues for planned work.

## Access

- **Read and write**: the `ada-mcp-gateway` Jira tools: `jira_search`, `jira_read`, `jira_get_comments`, `jira_create`, `jira_update`, `jira_comment`.
- **Read only**: Glean can also search and read PDCL tickets.

## Scope

PDCL is shared by many teams. Alloy tickets have the component **`AEP Web SDK`**.

- Add `component = "AEP Web SDK"` to every JQL query.
- Set that component on every ticket you create.

## Conventions

- **Create a ticket**: `jira_create` with `project: PDCL`, `type` (`Story`, `Bug`, or `Task`), `summary`, `description`, `component: AEP Web SDK`, the required Domain field `custom_fields: {customfield_23300: {value: "AEP Web SDK"}}`, and `epic_link` when the ticket belongs under an epic.
- **Read a ticket**: `jira_read` with the key (e.g. `PDCL-17215`); `jira_get_comments` for the comment thread.
- **List tickets**: `jira_search` with JQL, e.g. `project = PDCL AND component = "AEP Web SDK" AND labels = ready-for-agent AND statusCategory != Done ORDER BY created ASC`.
- **Make a ticket a child of a parent**: the parent is an Epic; set `epic_link` on the child.
- **Comment**: `jira_comment`.
- **Apply / remove labels**: `jira_update` with `labels`. Read the current labels first and send the full set.
- **Change status**: `jira_update` with `status` set to the target status name.

## PR and ticket lifecycle

Every PR needs a PDCL ticket. Statuses: `New` → `In Progress` → `Verification` → `Closed`.

| Event                       | Ticket status                                  |
| --------------------------- | ---------------------------------------------- |
| PR opened                   | `In Progress`                                  |
| PR merged                   | `Verification`                                 |
| Change shipped in a release | `Closed`                                       |
| Problem found after merge   | back to `In Progress` (comment on what failed) |
| Follow-up PR merged         | `Verification` again                           |

- Before opening a PR, find the ticket or create one. Put the key and link in the PR description under the template's `## Related Issue` heading: `[PDCL-12345](https://jira.corp.adobe.com/browse/PDCL-12345)`.
- A follow-up PR reuses the same ticket.
- A PR can reference several tickets; move each one.
- For an agent, a ticket is finished when its PR is merged and the ticket is in `Verification`. Never close a ticket on merge.
- **Released** means the change shipped in a stable (non-beta) npm release of the affected package: `@adobe/alloy`, `@adobe/alloy-core`, `@adobe/alloy-node`, or the Tags extension `reactor-extension-alloy`.
- **Fix version**: `Web SDK Next` / `Web SDK Extension Next` while unreleased; when closing, set it to the version that shipped (e.g. `Web SDK 2.31.0`, `Web SDK Extension 2.34.0`).

## Pull requests as a triage surface

**PRs as a request surface: no.** Work starts from a PDCL ticket.

## When a skill says "publish to the issue tracker"

Create a PDCL ticket as in **Create a ticket**.

## When a skill says "fetch the relevant ticket"

Read it as in **Read a ticket**. `PDCL-12345` is a Jira key; `#123` is a GitHub PR or issue on `adobe/alloy`.

## Wayfinding operations

Used by `/wayfinder`. Follows the pattern of PDCL-16605.

- **Map**: an Epic labelled `wayfinder:map`, component `AEP Web SDK`, holding the Notes / Decisions-so-far / Fog sections in its description.
- **Child ticket**: a Story with `epic_link` set to the map, labelled `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`).
- **Blocking**: a Jira `Blocks` issue link: `jira_update` with `issue_links: [{link_type: "Blocks", inward_issue: <blocker>, outward_issue: <blocked>}]`. A ticket is unblocked when every blocker is in a Done-category status.
- **Frontier query**: `project = PDCL AND "Epic Link" = <map> AND statusCategory != Done AND assignee is EMPTY ORDER BY Rank ASC`. Drop any ticket with an open blocker (read its `issuelinks`); the first remaining ticket wins.
- **Claim**: `jira_update` with `assignee` set to yourself, the session's first write.
- **Resolve**: `jira_comment` with the answer, then move the ticket to `Closed`, then add a pointer (gist + key) to the map's Decisions-so-far. Decision tickets have no PR, so they skip `Verification`. A ticket resolved by a PR follows the PR lifecycle above.
