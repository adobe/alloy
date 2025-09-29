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

## Contribution

Check out the [contribution guidelines](CONTRIBUTING.md) for quick start information, and head over to the [developer documentation](https://github.com/adobe/alloy/wiki) to understand the architecture and structure of the library.
