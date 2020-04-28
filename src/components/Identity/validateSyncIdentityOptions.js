import { objectOf } from "../../utils/validation";

export default objectOf({
  userIds: objectOf({}).required()
})
  .noUnknownFields()
  .required();
