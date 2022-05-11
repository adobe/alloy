import { anything, boolean, objectOf } from "../../utils/validation";

export default ({ options }) => {
  const validator = objectOf({
    renderDecisions: boolean(),
    request: objectOf({
      headers: anything().required(),
      body: anything().required()
    }).required(),
    response: objectOf({
      headers: anything().required(),
      body: anything().required()
    }).required()
  });

  return validator(options);
};
