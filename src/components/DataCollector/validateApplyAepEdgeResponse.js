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
    responseHeaders: anything(),
    responseBody: objectOf({
      handle: arrayOf(
        objectOf({
          type: string().required(),
          payload: anything().required()
        })
      ).required()
    }).required()
  });

  return validator(options);
};
