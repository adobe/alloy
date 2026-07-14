#!/bin/bash
# Detects whether there are changesets or JIRA file changes, and whether
# Production approval is required (stable releases only, not beta).
set -euo pipefail

shopt -s nullglob
changesets=()
for f in .changeset/*.md; do
  [[ "$(basename "$f")" == "README.md" ]] || changesets+=("$f")
done
has_changesets=${#changesets[@]}

changed_jira=$(git diff HEAD^1 HEAD --name-only -- '.jira/*.yml' | tr '\n' ' ')

changes_detected=false
if [[ "$has_changesets" -gt 0 || -n "$changed_jira" ]]; then
  changes_detected=true
fi
echo "changes_detected=$changes_detected" >> "$GITHUB_OUTPUT"
echo "changed_jira_files=$changed_jira" >> "$GITHUB_OUTPUT"

# Approval is required for stable releases (no pre.json) that have changesets.
# Beta releases (pre.json present) are auto-approved.
approval_needed=false
if [[ "$has_changesets" -gt 0 && ! -f .changeset/pre.json ]]; then
  approval_needed=true
fi
echo "approval_needed=$approval_needed" >> "$GITHUB_OUTPUT"
