import {
  enumOf,
  objectOf,
  literal,
  arrayOf,
  anyOf,
  string,
  boolean
} from "../../utils/validation";
import { validateIdentityMap } from "../../utils";
import { IN, OUT } from "../../constants/consentStatus";
import { GENERAL } from "../../constants/consentPurpose";

export default objectOf({
  consent: arrayOf(
    anyOf(
      [
        objectOf({
          standard: literal("Adobe").required(),
          version: literal("1.0").required(),
          value: objectOf({
            [GENERAL]: enumOf(IN, OUT).required()
          })
            .noUnknownFields()
            .required()
        })
          .noUnknownFields()
          .required(),
        objectOf({
          standard: literal("IAB").required(),
          version: literal("2.0").required(),
          value: string().required(),
          gdprApplies: boolean().required()
        })
          .noUnknownFields()
          .required()
      ],
      "a valid consent object"
    )
  )
    .nonEmpty()
    .required(),
  identityMap: validateIdentityMap
})
  .noUnknownFields()
  .required();
