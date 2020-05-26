# Conventions

Project conventions are reached through consensus and may not reflect a single developer's preferences. We ask that you try to adhere to conventions where possible. If you feel like a convention should be changed, please raise your concern in the issue tracker where it can be discussed as a group.

Most conventions and style guidelines are enforced automatically through [formatting and linting scripts](scripts.md). Below are some not covered or which deserve particular attention.

## Dependency Injection

To simplify and improve unit testing, the codebase makes extensive use of dependency injection. To illustrate, the following is a module that imports dependencies rather than using dependency injection.

### Importing Dependencies
```js
// getStoredConsentForPurpose.js

import cookieJar from "./cookieJar";
import parseConsentCookie from "./parseConsentCookie";

export default (purpose) => {
  const cookieValue = cookieJar.get(`alloy_consent`);
  
  if (cookieValue) {
    const parsedCookieValue = parseConsentCookie(cookieValue);
    return parsedCookieValue[purpose];
  }
};
```

## Injecting Dependencies

To easily be able to mock the `cookieJar` and `parseConsentCookie` dependencies when unit testing, we prefer instead to inject the dependencies into the module. Here's an example of using dependency injection, though we'll improve it in a moment.

```js
// getStoredConsentForPurpose.js

export default (cookieJar, parseConsentCookie, purpose) => {
  const cookieValue = cookieJar.get(`alloy_consent`);
  
  if (cookieValue) {
    const parsedCookieValue = parseConsentCookie(cookieValue);
    return parsedCookieValue[purpose];
  }
};
``` 

Now, let's assume we have another module, `personalizeContent.js`, which uses `getStoredConsentForPurpose.js`. If `personalizeContent.js`  is responsible for injecting `cookieJar` and `parseConsentCookie` into `getStoredConsentForPurpose.js`, where does `personalizeContent.js` get them? It would likewise receive them as injected dependencies. 

```js
// personalizeContent.js

export default (cookieJar, parseConsentCookie, getStoredConsentForPurpose, personalizations) => {
  const storedPersonalizationConsent = getStoredConsentForPurpose(
    cookieJar, 
    parseConsentCookie, 
    "personalization"
  );
  if (storedPersonalizationConsent === "in") {
    // Render personalizations.
  }
}
```

As you might imagine, this pattern would continue until we reach the project's entry file (`index.js`), which is where all modules would be imported:

```js
// index.js

import cookieJar from "./cookieJar";
import parseConsentCookie from "./parseConsentCookie";
import getStoredConsentForPurpose from "./getStoredConsentForPurpose";
import personalizeContent from "./personalizeContent";
import initialize from "./initialize";

initialize(
  cookieJar, 
  parseConsentCookie, 
  getStoredConsentForPurpose, 
  personalizeContent
);
```

Because `index.js` itself has very little logic, we would get little value in unit testing it. Therefore, we do not unit test the `index.js` file and instead exercise it through end-to-end tests.

This gets us closer to our preferred approach, but you may have noticed that we're potentially passing a large number of dependencies through several layers of modules that don't directly use the dependencies. For example, `personalizeContent` does not use `cookieJar`; it just passes it through to `getStoredConsentForPurpose`.  Notice also that every time `personalizeContent` is called, `cookieJar`, `parseConsent`, and `getStoredConsentForPurpose` will always be the same value, whereas `personalizations` may be different each time `personalizeContent` is called.

### Injecting Dependencies Directly From `index.js`

With this in mind, we can re-work our modules to use closures such that dependencies don't have to be passed through several layers, but are directly provided to each module by `index.js`. Here's how the final product would look. Notice we've also changed the name of each module to reflect the new pattern.

```js
// injectGetStoredConsentForPurpose.js

export default ({ cookieJar, parseConsentCookie }) => {
  return purpose => {
    const cookieValue = cookieJar.get(`alloy_consent`);
      
    if (cookieValue) {
      const parsedCookieValue = parseConsentCookie(cookieValue);
      return parsedCookieValue[purpose];
    }
  };
};
``` 

```js
// injectPersonalizeContent.js

export default ({ getStoredConsentForPurpose }) => {
  return personalizations => {
    const storedPersonalizationConsent = getStoredConsentForPurpose(
      cookieJar, 
      parseConsentCookie, 
      "personalization"
    );
    if (storedPersonalizationConsent === "in") {
      // Render personalizations.
    }
  }
}
```

```js
// index.js

import cookieJar from "./cookieJar";
import parseConsentCookie from "./parseConsentCookie";
import injectGetStoredConsentForPurpose from "./injectGetStoredConsentForPurpose";
import injectPersonalizeContent from "./injectPersonalizeContent";
import initialize from "./initialize";

const getStoredConsentForPurpose = injectGetStoredConsentForPurpose({
  cookieJar,
  parseConsentCookie
});

const personalizeContent = injectPersonalizeContent({
  getStoredConsentForPurpose
});

initialize({
  personalizeContent
});
```

This is the preferred approach for this project's source code with a couple caveats. An `index.js` file exists at both the top-level directory of the project and within each component directory. These are the appropriate files for importing modules. Modules should never be imported from any other file, with the exception of importing utilities (found in `utils` directories) and constants (found in `constants` directories), because they typically do not need to be mocked for the level of unit testing performed. However, if you feel you can more appropriately test your module by injecting a utility instead of importing it, feel free to do so.

## Factory Functions Instead Of Constructors

Constructors are functions that must be `new`ed in order to create an instance.

```js
const offer = new Offer();
```

Factory functions do not.

```js
const offer = createOffer();
```

For this codebase, factory functions are always preferred over constructors. Constructors should never be created. Factory functions should use the `create` prefix. The `this` keyword should rarely, if ever, be used.

## Reduce Instead Of ForEach

When computing a single value from an array of items, there are two popular approaches: `reduce` and `forEach`. To illustrate the difference, let's take an example where we have a list of purpose names and we'd like to build an object where the property names are the purpose names and the value is initialized using a `PENDING` constant. This could be used to track a user's consent on a per-purpose basis, for example.

Using `reduce`:

```js
const consentByPurposeName = purposeNames.reduce((memo, purposeName) => {
  memo[purposeName] = PENDING;
  return memo;
}, {});
```

Using `forEach`:

```js
const consentByPurposeName = {};
purposeNames.forEach(purposeName => {
  consentByPurposeName[purposeName] = PENDING;
});
```

Both examples produce the same result. In this scenario, please use the `reduce` pattern.

This convention only applies when producing a single value (in this case, an object) from an array of items. Using `forEach` may still be appropriate in other situations.

## Enumerations

When you have an enumeration of values and would like to share those values across multiple modules, the enumeration values should be placed into a separate module and each value should be its own named export. To illustrate, here's how you would create a module for an enumeration of HTML tag names.

```js
// tagName.js

export const BODY = "BODY";
export const IFRAME = "IFRAME";
export const IMG = "IMG";
export const DIV = "DIV";
export const STYLE = "STYLE";
export const SCRIPT = "SCRIPT";
export const SRC = "src";
export const HEAD = "HEAD";
```  

For consistency, the name of the module (`tagName.js`) should be singular rather than plural. The module should be placed within a `constants` directory. A consuming module may then import an enumeration value as follows:

```js
// renderOffer.js

import { DIV } from "../constants/tagName";
```

If a consuming module needs all enumeration values as an array, import them as follows:

```js
// renderOffer.js

import * as tagNames from "../constants/tagName";
```

## Linking To Documentation

If you are writing code that logs a message referring the user to a particular piece of documentation, please link to the documentation using an `adobe.ly` URL. To make an `adobe.ly` URL, go to [Bitly](https://bitly.com/) and shorten the documentation URL. As long as the documentation URL begins with `https://www.adobe.io`, Bitly should provide you with a short url using the `adobe.ly` domain.

If you need to change the documentation URL that the `adobe.ly` URL redirects to, please open an issue in this repository requesting the change.
