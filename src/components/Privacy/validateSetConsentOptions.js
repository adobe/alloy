import { enumOf, objectOf } from "../../utils/validation";
import { IN, OUT } from "../../constants/consentStatus";
import { GENERAL } from "../../constants/consentPurpose";

export default objectOf({
  [GENERAL]: enumOf(IN, OUT).required()
})
  .noUnknownFields()
  .required();
