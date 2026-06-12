#!/usr/bin/env bash
# Runs pnpm lint + format on each migrate-integration branch, commits and pushes if changed.
set -euo pipefail

REPO_DIR="$(git rev-parse --show-toplevel)"
ORIG_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
LOG_FILE="/tmp/lint-format-branches.log"
: > "$LOG_FILE"

branches=(
  migrate-integration/00-infra
  migrate-integration/01-install-sdk
  migrate-integration/02-context
  migrate-integration/03-logging
  migrate-integration/04-library-info
  migrate-integration/05-location-hints
  migrate-integration/06-config-overrides
  migrate-integration/07-data-collector
  migrate-integration/08-identity
  migrate-integration/09-id-migration
  migrate-integration/10-consent
  migrate-integration/11-iab
  migrate-integration/12-personalization-render
  migrate-integration/13-personalization-spa
  migrate-integration/14-personalization
  migrate-integration/15-personalization-interactions
  migrate-integration/16-media-collection
  migrate-integration/17-brand-concierge
  migrate-integration/18-rules-engine
  migrate-integration/19-migration
  migrate-integration/20-visitor
)

cleanup() {
  echo "Restoring $ORIG_BRANCH..." | tee -a "$LOG_FILE"
  git checkout "$ORIG_BRANCH" >> "$LOG_FILE" 2>&1 || true
}
trap cleanup EXIT

for branch in "${branches[@]}"; do
  echo "=== $branch ===" | tee -a "$LOG_FILE"

  git checkout "$branch" >> "$LOG_FILE" 2>&1
  git pull --ff-only origin "$branch" >> "$LOG_FILE" 2>&1 || true

  # lint (--fix is built into the script)
  pnpm run lint >> "$LOG_FILE" 2>&1 || true
  # format writes files in place
  pnpm run format >> "$LOG_FILE" 2>&1 || true

  if git diff --quiet && git diff --cached --quiet; then
    echo "  no changes" | tee -a "$LOG_FILE"
  else
    git add -A
    git commit -m "$(printf 'chore: apply prettier and eslint formatting\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>')" >> "$LOG_FILE" 2>&1
    git push origin "$branch" >> "$LOG_FILE" 2>&1
    echo "  pushed formatting fix" | tee -a "$LOG_FILE"
  fi
done

echo "Done. Log at $LOG_FILE"
