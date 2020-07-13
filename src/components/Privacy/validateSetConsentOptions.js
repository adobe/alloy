import { objectOf, anything, arrayOf } from "../../utils/validation";

export default objectOf({
  consent: arrayOf(anything())
    .required()
    .nonEmpty()
})
  .noUnknownFields()
  .required();
