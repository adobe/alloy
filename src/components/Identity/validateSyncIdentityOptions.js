import { objectOf } from "../../utils/validation";

export default objectOf({
  identity: objectOf({}).required()
})
  .noUnknownFields()
  .required();
