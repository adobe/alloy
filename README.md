[![Build Status](https://travis-ci.org/adobe/alloy.svg?branch=master)](https://travis-ci.org/adobe/alloy)

# Alloy

Alloy is the code name for the Adobe Experience Platform Web SDK. It allows for recording events into the Adobe Experience Platform, syncing identities, personalizing content, and more.

For documentation on how to use Alloy, please see the [user documentation](https://adobe.ly/36dGGp6).

For documentation on how to contribute to Alloy, please see the [developer documentation](https://github.com/adobe/alloy/wiki).

## Installation

There are three supported ways to use Alloy.
  1. Using Adobe Launch, install the Adobe Experience Platform Web SDK Extension.
  2. Use the pre-built, minified version available via a CDN. You could also self-host this version.
  3. Use the NPM library which exports an ES6 module.

### Using the launch extension

For documentation on the AEP Web SDK Launch Extension see the [launch documentation](https://docs.adobe.com/content/help/en/launch/using/extensions-ref/adobe-extension/aep-extension/overview.html)

### Using the stand alone version

```html
<script>
  !function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||
  []).push(o),n[o]=function(){var u=arguments;return new Promise(
  function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}
  (window,["alloy"]);
</script>
<script src="https://cdn1.adoberesources.net/alloy/2.2.0/alloy.min.js" async></script>
<script>
  window.alloy("config", { ... });
  window.alloy("sendEvent", { ... });
</script>
```

### Using the NPM library

```bash
npm install @adobe/alloy
```

Using the library:

```javascript
import { baseCode, core } from "@adobe/alloy";
baseCode(["alloy"]);   // creates the window.alloy function
core();                // runs

window.alloy("config", { ... });
window.alloy("sendEvent", { ... });
```

The ES6 exports are exposed via the NPM "module" property, so you may need to adjust your rollup system to look for the module property.


