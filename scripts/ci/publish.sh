#!/bin/bash
# Publishes packages to npm and pushes release tags.
# changeset publish skips already-on-npm versions; tag backfills uniformly.
set -euo pipefail

pnpm changeset publish
pnpm changeset tag
git push --tags
