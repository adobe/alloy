#!/bin/bash
# Bumps package versions according to pending changesets.
# No-op when no changesets are present.
set -euo pipefail

pnpm changeset version
