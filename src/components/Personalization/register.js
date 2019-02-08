// The register.js modules can be instead part of the build system
// where we use meta programming to generate those lines of code
// if the customer chooses to install this Component.

// OR we can have them defined in each Component like that, and we import
// those modules on demand in the build system.

// This way the Actual component is pure and does not register itself.

import Core from "../Core";
import Personalization from "./index";

function register() {
    const personalization = new Personalization();
    Core.registerComponent(personalization);
    return personalization;
}

export default register;
