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
import type {
  AnyValidator,
  StringValidator,
} from "../../utils/validation/types.js";
import LIBRARY_VERSION from "../../constants/libraryVersion.js";
import type { Logger } from "../../core/types.js";

// Follows the same API as Javascript 3.x SDK
// https://adobe-marketing-cloud.github.io/media-sdks/reference/javascript_3x/index.html

export interface MediaHelperOptions {
  logger: Logger;
}

export default ({ logger }: MediaHelperOptions) => {
  // Schema keys define positional argument order. mapValidatedToXdm receives the same order after validation.
  const withValidation = <TArgs extends unknown[], TResult>(
    helperName: string,
    schema: Record<string, AnyValidator>,
    mapValidatedToXdm: (...validatedArgs: TArgs) => TResult,
  ) => {
    const validate = objectOf(schema);
    const paramKeys = Object.keys(schema);

    return (...args: unknown[]): TResult | Record<string, never> => {
      const params = Object.fromEntries(
        paramKeys.map((key, index) => [key, args[index]]),
      );
      try {
        // objectOf returns the validated params object.
        const validated = validate(params) as Record<string, unknown>;
        const validatedArgs = paramKeys.map((key) => validated[key]);
        // The schema validated each argument in schema order.
        return mapValidatedToXdm(...(validatedArgs as TArgs));
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
    (
      name: string,
      id: string,
      length: number,
      streamType: string,
      mediaType: string,
    ) => ({
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
    (name: string, position: number, startTime: number) => ({
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
    (name: string, id: string, position: number, length: number) => ({
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
    (name: string, position: number, length: number, startTime: number) => ({
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
      // matches ignores the message argument; it is kept so the bundle is unchanged.
      stateName: (
        string().matches as (
          pattern: RegExp,
          message: string,
        ) => ReturnType<StringValidator["matches"]>
      )(STATE_NAME_REGEX, "This is not a valid state name."),
    },
    (stateName: string) => ({
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
    (
      bitrate: number,
      startupTime: number,
      fps: number,
      droppedFrames: number,
    ) => ({
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
