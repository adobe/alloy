

import createAddEventHandler from "./createAddEventHandler";
import createComponent from "./createComponent";
import createConfigValidators from "./createConfigValidators";

const addEventHandler = createAddEventHandler(window);
const createAutoImplementation = createComponent({});

createAutoImplementation.configValidators = createConfigValidators({ addEventHandler });

export default createAutoImplementation;
