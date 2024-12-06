import {objectOf, string} from "../../utils/validation/index.js";

export default ({options, logger}) => {
  const brandConciergeEventValidator = objectOf({
    message: string().required()
  }).required();

  return brandConciergeEventValidator(options);
}