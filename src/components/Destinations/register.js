// The register.js modules can be instead part of the build system
// where we use meta programming to generate those lines of code
// if the customer chooses to install this Component.

// OR we can have them defined in each Component like that, and we import
// those modules on demand in the build system.

// This way the Actual component is pure and does not register itself.

import Core from "../Core";
import Destinations from "./index";

function register() {
    const destinations = new Destinations();
    Core.registerComponent(destinations);
    return destinations;
}

export default register;
