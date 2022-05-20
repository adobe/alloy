import {
  anything,
  arrayOf,
  boolean,
  objectOf,
  string
} from "../../utils/validation";

export default ({ options }) => {
  const validator = objectOf({
    renderDecisions: boolean(),
    handles: arrayOf(
      objectOf({
        type: string().required(),
        payload: anything().required()
      })
    ).required()
  });

  return validator(options);
};
