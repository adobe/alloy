import {
  anyOf,
  anything,
  callback,
  objectOf,
  string
} from "../../utils/validation";

export default ({ options }) => {
  const sessionValidator = anyOf(
    [
      objectOf({
        playerId: string().required(),
        onBeforeMediaEvent: callback().required(),
        xdm: objectOf({
          eventType: string().required(),
          mediaCollection: objectOf({
            sessionDetails: objectOf(anything()).required()
          })
        })
      }).required(),
      objectOf({
        xdm: objectOf({
          eventType: string().required(),
          mediaCollection: objectOf({
            sessionID: string().required(),
            playhead: string().required(),
            sessionDetails: objectOf(anything()).required()
          })
        })
      }).required()
    ],
    "Error validating the createMediaSession command options."
  );

  return sessionValidator(options);
};
