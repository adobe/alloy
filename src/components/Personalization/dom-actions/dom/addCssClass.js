import {isNonEmptyString} from "../../../../utils/index.js";

export default (element, name) => {
  if (name && isNonEmptyString(name)) {
    element.classList.add(name);
  }
};
