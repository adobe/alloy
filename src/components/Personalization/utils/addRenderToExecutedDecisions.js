import { assign } from "../../../utils";

export default decisions => {
  return decisions.map(decision => assign({ rendered: true }, decision));
};
