import { anything, string, objectOf, arrayOf } from "../../utils/validation";
import { EMPTY_PROPOSITIONS } from "./createApplyPropositions";

export default ({ logger, options }) => {
  const applyPropositionsOptionsValidator = objectOf({
    propositions: arrayOf(objectOf(anything())).nonEmpty(),
    metadata: objectOf(anything()),
    viewName: string()
  }).required();

  try {
    return applyPropositionsOptionsValidator(options);
  } catch (e) {
    logger.warn(
      "Invalid options for applyPropositions. No propositions will be applied.",
      e
    );
    return EMPTY_PROPOSITIONS;
  }
};
