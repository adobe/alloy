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

import { number, objectOf, string } from "../../utils/validation/index.js";
import LIBRARY_VERSION from "../../constants/libraryVersion.js";

// Follows the same API as Javascript 3.x SDK
// https://adobe-marketing-cloud.github.io/media-sdks/reference/javascript_3x/index.html

export default ({ logger }) => {
  // Schema keys define positional argument order. mapValidatedToXdm receives the same order after validation.
  const withValidation = (helperName, schema, mapValidatedToXdm) => {
    const validate = objectOf(schema);
    const paramKeys = Object.keys(schema);

    return (...args) => {
      const params = Object.fromEntries(
        paramKeys.map((key, index) => [key, args[index]]),
      );
      try {
        const validated = validate(params);
        const validatedArgs = paramKeys.map((key) => validated[key]);
        return mapValidatedToXdm(...validatedArgs);
      } catch (error) {
        logger.warn(
          `An error occurred while creating the ${helperName}.`,
          error,
        );
        return {};
      }
    };
  };

  const createMediaObject = withValidation(
    "MediaObject",
    {
      name: string().nonEmpty(),
      id: string().nonEmpty(),
      length: number().required(),
      streamType: string().nonEmpty(),
      mediaType: string().nonEmpty(),
    },
    (name, id, length, streamType, mediaType) => ({
      sessionDetails: {
        friendlyName: name,
        name: id,
        length: Math.round(length),
        contentType: streamType,
        streamType: mediaType,
      },
    }),
  );

  // Position and startTime swapped in original implementation.
  const createAdBreakObject = withValidation(
    "AdBreakObject",
    {
      name: string().nonEmpty(),
      position: number(),
      startTime: number(),
    },
    (name, position, startTime) => ({
      advertisingPodDetails: {
        friendlyName: name,
        index: position,
        offset: startTime,
      },
    }),
  );

  const createAdObject = withValidation(
    "AdObject",
    {
      name: string().nonEmpty(),
      id: string().nonEmpty(),
      position: number(),
      length: number(),
    },
    (name, id, position, length) => ({
      advertisingDetails: {
        friendlyName: name,
        name: id,
        podPosition: position,
        length,
      },
    }),
  );

  // Position and startTime swapped in original implementation.
  const createChapterObject = withValidation(
    "ChapterObject",
    {
      name: string().nonEmpty(),
      position: number(),
      length: number(),
      startTime: number(),
    },
    (name, position, length, startTime) => ({
      chapterDetails: {
        friendlyName: name,
        index: position,
        length,
        offset: startTime,
      },
    }),
  );

  const STATE_NAME_REGEX = /^[a-zA-Z0-9_]{1,64}$/;

  const createStateObject = withValidation(
    "StateObject",
    {
      stateName: string().matches(
        STATE_NAME_REGEX,
        "This is not a valid state name.",
      ),
    },
    (stateName) => ({
      name: stateName,
    }),
  );

  // startupTime and droppedFrames swapped in original implementation.
  const createQoEObject = withValidation(
    "QoEObject",
    {
      bitrate: number(),
      startupTime: number(),
      fps: number(),
      droppedFrames: number(),
    },
    (bitrate, startupTime, fps, droppedFrames) => ({
      bitrate,
      timeToStart: startupTime,
      framesPerSecond: fps,
      droppedFrames,
    }),
  );

  return {
    createMediaObject,
    createAdBreakObject,
    createAdObject,
    createChapterObject,
    createStateObject,
    createQoEObject,
    version: `WEBSDK ${LIBRARY_VERSION}`,
  };
};
