/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { number, objectOf, string } from "../../utils/validation";

export const createMediaObject = (
  friendlyName,
  name,
  length,
  contentType,
  streamType
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

  try {
    const result = validate(mediaObject);
    const sessionDetails = {
      name: result.name,
      friendlyName: result.friendlyName,
      length: result.length,
      streamType: result.streamType,
      contentType: result.contentType
    };
    return { sessionDetails };
  } catch (error) {
    return {};
  }
};
export const createAdBreakObject = (name, position, startTime) => {
  const adBreakObject = {
    friendlyName: name,
    offset: position,
    index: startTime
  };
  const validator = objectOf({
    friendlyName: string().nonEmpty(),
    offset: number(),
    index: number()
  });

  try {
    const result = validator(adBreakObject);
    const advertisingPodDetails = {
      friendlyName: result.friendlyName,
      offset: result.offset,
      index: result.index
    };

    return { advertisingPodDetails };
  } catch (error) {
    return {};
  }
};
export const createAdObject = (name, id, position, length) => {
  const adObject = {
    friendlyName: name,
    name: id,
    podPosition: position,
    length
  };

  const validator = objectOf({
    friendlyName: string().nonEmpty(),
    name: string().nonEmpty(),
    podPosition: number(),
    length: number()
  });

  try {
    const result = validator(adObject);
    const advertisingDetails = {
      friendlyName: result.friendlyName,
      name: result.name,
      podPosition: result.podPosition,
      length: result.length
    };

    return { advertisingDetails };
  } catch (error) {
    return {};
  }
};
export const createChapterObject = (name, position, length, startTime) => {
  const chapterDetailsObject = {
    friendlyName: name,
    offset: position,
    length,
    index: startTime
  };

  const validator = objectOf({
    friendlyName: string().nonEmpty(),
    offset: number(),
    length: number(),
    index: number()
  });

  try {
    const result = validator(chapterDetailsObject);
    const chapterDetails = {
      friendlyName: result.friendlyName,
      offset: result.offset,
      index: result.index,
      length: result.length
    };

    return { chapterDetails };
  } catch (error) {
    return {};
  }
};
export const createStateObject = stateName => {
  const STATE_NAME_REGEX = new RegExp("^[a-zA-Z0-9_\\.]{1,64}$");

  const state = {
    state: stateName
  };
  const validator = objectOf({
    state: string().regexp(STATE_NAME_REGEX)
  });

  try {
    const result = validator(state);
    const stateDetails = {
      name: result.name
    };

    return { stateDetails };
  } catch (error) {
    return {};
  }
};
export const createQoEObject = (bitrate, droppedFrames, fps, startupTime) => {
  const qoeObject = {
    bitrate,
    droppedFrames,
    fps,
    startupTime
  };

  const validator = objectOf({
    bitrate: number(),
    droppedFrames: number(),
    fps: number(),
    startupTime: number()
  });

  try {
    const result = validator(qoeObject);
    const qoeDetails = {
      bitrate: result.bitrate,
      droppedFrames: result.droppedFrames,
      fps: result.fps,
      startupTime: result.startupTime
    };

    return { qoeDetails };
  } catch (error) {
    return {};
  }
};
