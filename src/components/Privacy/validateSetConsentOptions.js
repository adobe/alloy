import { enumOf, objectOf, literal, arrayOf } from "../../utils/validation";
import { IN, OUT } from "../../constants/consentStatus";
import { GENERAL } from "../../constants/consentPurpose";

export default objectOf({
  preferences: arrayOf(
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
      .required()
  )
    .nonEmpty()
    .required()
})
  .noUnknownFields()
  .required();
