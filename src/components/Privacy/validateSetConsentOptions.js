import { objectOf, anything, arrayOf } from "../../utils/validation";
import { validateIdentityMap } from "../../utils";

export default objectOf({
  consent: arrayOf(anything())
    .required()
    .nonEmpty(),
  identityMap: validateIdentityMap
})
  .noUnknownFields()
  .required();
