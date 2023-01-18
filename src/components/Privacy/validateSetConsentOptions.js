import { objectOf, anything, arrayOf } from "../../utils/validation";
import { validateIdentityMap, validateConfigOverride } from "../../utils";

export default objectOf({
  consent: arrayOf(anything())
    .required()
    .nonEmpty(),
  identityMap: validateIdentityMap,
  edgeConfigOverrides: validateConfigOverride
})
  .noUnknownFields()
  .required();
