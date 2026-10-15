![Alloy Main Branch | Konductor Prod](https://github.com/adobe/alloy/actions/workflows/prod.yml/badge.svg)
![alloy](https://img.shields.io/bundlephobia/min/@adobe/alloy?logo=Adobe&style=for-the-badge)
![alloy](https://img.shields.io/bundlephobia/minzip/@adobe/alloy?logo=Adobe&style=for-the-badge)

# Alloy

Alloy is the code name for the Adobe Experience Platform Web SDK. It allows for recording events into Adobe Experience Platform, syncing identities, personalizing content, and more.

For documentation on how to use Alloy, please see the [user documentation](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/home).

## Organization

This repo contains multiple projects. Each one is in a subdirectory and has its own `package.json` file.

- [`sandboxes/`](./sandboxes) - Contains sample projects that demonstrate how to use Alloy in different scenarios.
  - [`browser/` - `@adobe/alloy-sandbox-browser`](./sandboxes/browser) - the web browser sandbox
- [`packages/`](./packages)
  - [`core/` - `@adobe/alloy-core`](./packages/core) - Contains the core "business logic" for interacting with the Adobe Experience Platform Edge Network.

## Development

Run `pnpm dev` from the repository root to build required artifacts through
dependency-ordered `dev:prepare` scripts, then start all workspace `dev` scripts
in parallel: the browser SDK build watcher, browser sandbox, and reactor extension
development environment. Packages without the relevant script are skipped.
The browser sandbox uses http://localhost:3001, leaving ports 3000 (HTTP) and 4000
(HTTPS) for the reactor extension sandbox.

Run `pnpm dev:browser` to start only the browser sandbox and its dependencies'
development processes. The sandbox runs at http://localhost:3000 and consumes
workspace source directly; the SDK watcher also keeps distribution files current.

The Node sandbox contains one-shot examples rather than a development server, so
it is not started by these commands.

## Contribution

Check out the [contribution guidelines](CONTRIBUTING.md) for quick start information, and head over to the [developer documentation](https://github.com/adobe/alloy/wiki) to understand the architecture and structure of the library.
