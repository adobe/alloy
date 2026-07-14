#!/bin/bash
# Stages all working-tree changes (changeset version bumps + JIRA file
# updates) and commits them in a single [skip ci] commit.
set -euo pipefail

git config user.name  "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git pull --rebase origin main
git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: publish [skip ci]"
  git push origin HEAD:main
fi
