#!/bin/bash
# Applies any changed .jira/*.yml files to JIRA and posts a PR comment
# listing the tickets that were created or updated.
# GITHUB_PR_URL and GITHUB_PR_TITLE are set as env vars for process.js.
set -euo pipefail

changed_files="${CHANGED_JIRA_FILES:-}"
[[ -z "$changed_files" ]] && exit 0

pr_info=$(gh pr list --state merged --base main --limit 5 \
  --json number,url,title --jq 'map(select(.number != null)) | first')
export GITHUB_PR_URL=$(echo "$pr_info" | jq -r '.url   // ""')
export GITHUB_PR_TITLE=$(echo "$pr_info" | jq -r '.title // ""')
pr_number=$(echo "$pr_info" | jq -r '.number // ""')

applied_tickets=""
for file in $changed_files; do
  ticket_key=$(node scripts/jira/process.js "$file")
  [[ -n "$ticket_key" ]] && applied_tickets="$applied_tickets $ticket_key"
done

if [[ -n "$applied_tickets" && -n "$pr_number" ]]; then
  base_url="https://jira.corp.adobe.com/browse"
  body="**JIRA tickets updated by this PR:**"$'\n'
  for key in $applied_tickets; do
    body="$body"$'\n'"- [$key]($base_url/$key)"
  done
  gh pr comment "$pr_number" --body "$body"
fi
