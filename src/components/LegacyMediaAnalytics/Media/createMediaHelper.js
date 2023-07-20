import { number, objectOf, string } from "../../../utils/validation";
import {
  Event,
  AdMetadataKeys,
  AudioMetadataKeys,
  MediaObjectKey,
  MediaType,
  PlayerState,
  StreamType,
  VideoMetadataKeys
} from "./constants";

export default () => {
  return {
    Event,
    MediaType,
    PlayerState,
    StreamType,
    MediaObjectKey,
    VideoMetadataKeys,
    AudioMetadataKeys,
    AdMetadataKeys,
    createMediaObject: (
      friendlyName,
      name,
      length,
      streamType,
      contentType
    ) => {
      const mediaObject = {
        friendlyName,
        name,
        length,
        streamType,
        contentType
      };

      const validate = objectOf({
        friendlyName: string().nonEmpty(),
        name: string().nonEmpty(),
        length: number().required(),
        streamType: string().nonEmpty(),
        contentType: string().nonEmpty()
      });

      return validate(mediaObject);
    },
    createAdBreakObject: (name, position, startTime) => {
      const advertisingPodDetails = {
        friendlyName: name,
        offset: position,
        index: startTime
      };

      const validator = objectOf({
        friendlyName: string().notEmpty(),
        offset: number().min(0),
        index: number().min(0)
      });
      return validator(advertisingPodDetails);
    },
    createAdObject: (name, id, position, length) => {
      const advertisingDetails = {
        friendlyName: name,
        name: id,
        podPosition: position,
        length
      };

      const validator = objectOf({
        friendlyName: string().nonEmpty(),
        name: string().nonEmpty(),
        podPosition: number().min(1),
        length: number().min(1)
      });

      return validator(advertisingDetails);
    },
    createChapterObject: (name, position, length, startTime) => {
      const chapterDetails = {
        friendlyName: name,
        offset: position,
        length,
        index: startTime
      };

      const validator = objectOf({
        friendlyName: string().nonEmpty(),
        offset: number().min(1),
        length: number().min(0),
        index: number().min(0)
      });
      return validator(chapterDetails);
    },
    createStateObject: stateName => {
      const STATE_NAME_REGEX = new RegExp("^[a-zA-Z0-9_\\.]{1,64}$");

      const state = {
        stateName
      };
      const validator = objectOf({
        state: string().regexp(STATE_NAME_REGEX)
      });

      return validator(state);
    },
    createQoEObject: (bitrate, droppedFrames, fps, startupTime) => {
      const qoeObject = {
        bitrate,
        droppedFrames,
        fps,
        startupTime
      };

      const validator = objectOf({
        bitrate: number().min(0),
        droppedFrames: number().min(0),
        fps: number().min(0),
        startupTime: number().min(0)
      });

      return validator(qoeObject);
    }
  };
};
