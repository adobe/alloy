import { objectOf, anything, arrayOf } from "../../utils/validation/index";
import { validateIdentityMap } from "../../utils/index";

export default objectOf({
  consent: arrayOf(anything())
    .required()
    .nonEmpty(),
  identityMap: validateIdentityMap
})
  .noUnknownFields()
  .required();
