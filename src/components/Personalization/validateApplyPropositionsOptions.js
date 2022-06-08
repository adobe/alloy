import { anything, objectOf, arrayOf } from "../../utils/validation";

export const EMPTY_PROPOSITIONS = { propositions: [] };

export default ({ logger, options }) => {
  const applyPropositionsOptionsValidator = objectOf({
    propositions: arrayOf(objectOf(anything())).nonEmpty(),
    metadata: objectOf(anything())
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
