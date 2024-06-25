/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createMediaHelper from "../../../../../src/components/LegacyMediaAnalytics/createMediaHelper.js";

describe("createMediaHelper", () => {
  let logger;
  let mediaHelper;

  beforeEach(() => {
    logger = {
      warn: jasmine.createSpy("warn"),
    };
    mediaHelper = createMediaHelper({ logger });
  });

  describe("createMediaObject", () => {
    it("should return a valid media object when called with valid arguments", () => {
      const friendlyName = "testFriendlyName";
      const name = "testName";
      const length = 120;
      const contentType = "video/mp4";
      const streamType = "VOD";

      const expectedResult = {
        sessionDetails: {
          friendlyName,
          name,
          length,
          contentType,
          streamType,
        },
      };

      const result = mediaHelper.createMediaObject(
        friendlyName,
        name,
        length,
        contentType,
        streamType,
      );

      expect(result).toEqual(expectedResult);
    });

    it("should log a warning and return an empty object when validation fails", () => {
      const friendlyName = "";
      const name = "";
      const length = "invalid";
      const contentType = "";
      const streamType = "";

      const expectedResult = {};

      const result = mediaHelper.createMediaObject(
        friendlyName,
        name,
        length,
        contentType,
        streamType,
      );

      expect(result).toEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("createAdBreakObject", () => {
    it("should return a valid ad break object when called with valid arguments", () => {
      const name = "testAdBreak";
      const position = 1;
      const startTime = 120;

      const expectedResult = {
        advertisingPodDetails: {
          friendlyName: name,
          offset: position,
          index: startTime,
        },
      };

      const result = mediaHelper.createAdBreakObject(name, position, startTime);

      expect(result).toEqual(expectedResult);
    });

    it("should log a warning and return an empty object when validation fails", () => {
      const name = "";
      const position = "invalid";
      const startTime = "invalid";

      const expectedResult = {};

      const result = mediaHelper.createAdBreakObject(name, position, startTime);

      expect(result).toEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("createAdObject", () => {
    it("should return a valid ad object when called with valid arguments", () => {
      const name = "testAd";
      const id = "testId";
      const position = 1;
      const length = 30;

      const expectedResult = {
        advertisingDetails: {
          friendlyName: name,
          name: id,
          podPosition: position,
          length,
        },
      };

      const result = mediaHelper.createAdObject(name, id, position, length);

      expect(result).toEqual(expectedResult);
    });

    it("should log a warning and return an empty object when validation fails", () => {
      const name = "";
      const id = "";
      const position = "invalid";
      const length = "invalid";

      const expectedResult = {};

      const result = mediaHelper.createAdObject(name, id, position, length);

      expect(result).toEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("createChapterObject", () => {
    it("should return a valid chapter object when called with valid arguments", () => {
      const name = "testChapter";
      const position = 1;
      const length = 30;
      const startTime = 120;

      const expectedResult = {
        chapterDetails: {
          friendlyName: name,
          offset: position,
          length,
          index: startTime,
        },
      };

      const result = mediaHelper.createChapterObject(
        name,
        position,
        length,
        startTime,
      );

      expect(result).toEqual(expectedResult);
    });

    it("should log a warning and return an empty object when validation fails", () => {
      const name = "";
      const position = "invalid";
      const length = "invalid";
      const startTime = "invalid";

      const expectedResult = {};

      const result = mediaHelper.createChapterObject(
        name,
        position,
        length,
        startTime,
      );

      expect(result).toEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("createStateObject", () => {
    it("should return a valid state object when called with valid arguments", () => {
      const stateName = "testState";

      const expectedResult = {
        name: stateName,
      };

      const result = mediaHelper.createStateObject(stateName);

      expect(result).toEqual(expectedResult);
    });

    it("should log a warning and return an empty object when validation fails", () => {
      const stateName = "invalid state name";

      const expectedResult = {};

      const result = mediaHelper.createStateObject(stateName);

      expect(result).toEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("createQoEObject", () => {
    it("should return a valid QOE object when called with valid arguments", () => {
      const bitrate = 5000;
      const droppedFrames = 10;
      const framesPerSecond = 30;
      const timeToStart = 2;

      const expectedResult = {
        bitrate,
        droppedFrames,
        framesPerSecond,
        timeToStart,
      };

      const result = mediaHelper.createQoEObject(
        bitrate,
        droppedFrames,
        framesPerSecond,
        timeToStart,
      );

      expect(result).toEqual(expectedResult);
    });

    it("should log a warning and return an empty object when validation fails", () => {
      const bitrate = "invalid";
      const droppedFrames = "invalid";
      const fps = "invalid";
      const startupTime = "invalid";

      const expectedResult = {};

      const result = mediaHelper.createQoEObject(
        bitrate,
        droppedFrames,
        fps,
        startupTime,
      );

      expect(result).toEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
