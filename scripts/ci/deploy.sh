#!/bin/bash
# Runs package-level side-effect deploys, creates GitHub releases, and
# re-enters beta pre-mode after a stable release.
# Requires CDN SSH key to be loaded before calling (via webfactory/ssh-agent).
set -euo pipefail

# Each package owns its idempotent deploy via a `release` script.
pnpm --recursive --workspace-concurrency=1 --no-bail --if-present run release

# Create GitHub releases for any new tags at HEAD (skips existing releases).
node scripts/createGithubReleases.js

# After a stable release, prep the next cycle by re-entering beta pre-mode.
if [[ ! -f .changeset/pre.json ]]; then
  pnpm changeset pre enter beta
  git config user.name  "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git add .changeset/pre.json
  git commit -m "chore: re-enter beta pre mode [skip ci]"
  git push origin HEAD:main
fi
