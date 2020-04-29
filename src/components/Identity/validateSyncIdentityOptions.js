import { objectOf } from "../../utils/validation";

export default objectOf({
  identities: objectOf({}).required()
})
  .noUnknownFields()
  .required();
