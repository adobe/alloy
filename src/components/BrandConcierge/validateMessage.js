import {anyOf, arrayOf, objectOf, string} from "../../utils/validation/index.js";

export default ({options, logger}) => {
  const brandConciergeEventValidator = anyOf([
    objectOf({
    message: string().required()
  }),
  objectOf({
    feedback: objectOf({
      conversationId: string(),
      interactionId: string(),
      classification: string(),
      comment: string(),
      reasons: arrayOf(string())
    })
  }).required()]);

  return brandConciergeEventValidator(options);
}