import {isNonEmptyString} from "../../../../utils/index.js";

export default (element, name) => {
  if (name && isNonEmptyString(name)) {
    return element.classList.contains(name);
  }
  return false;
};
