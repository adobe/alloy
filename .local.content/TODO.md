# Adobe Alloy Monorepo Migration TODO

## Status: COMPLETED ✅

### Migration Work Completed ✅

- [x] Analyze current repository structure and dependencies
- [x] Create packages/core directory structure
- [x] Move src/ contents to packages/core/src/
- [x] Move sandbox to sandboxes/browser/
- [x] Create packages/core/package.json
- [x] Update root package.json for npm workspaces
- [x] Create .local.content/TODO.md file
- [x] Modularize ESLint Config (previous work)
- [x] Set up git config for commits and clean up git status
- [x] Clean up git status and commit current changes
- [x] Update build scripts and configurations
- [x] Update GitHub Actions workflows
- [x] Test that all npm scripts still work
- [x] Verify import paths and exports

### Final Verification Completed ✅

- [x] Fix alloyBuilder CLI script for monorepo structure
- [x] Verify build process works correctly
- [x] Verify npm prepack works correctly
- [x] Verify unit tests pass (all 2000+ tests)
- [x] Verify integration tests pass (all 20 tests)
- [x] Verify CLI functionality works
- [x] Verify workspace structure is correct

## Migration Goals

The goal is to have an invisible migration, meaning:

- All the github actions should continue to work
- The basic top level npm scripts (test aka test:functional, test:integration, test:unit), build, dev, etc, should continue to work.
- `import { createInstance } from "@adobe/alloy"` should continue to work
- `npx @adobe/alloy` should continue to work.

In short, no one should know that the repo structure has changed.

## Previous Work Accomplished:

### ESLint Modularization

- **Created `packages/core/eslint.config.js`** with core-specific rules
- **Updated root `eslint.config.js`** to remove package-specific rules
- **Tested the new configuration** works correctly
