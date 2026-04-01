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
import { vi, beforeEach, describe, it, expect } from "vitest";
import createMediaHelper from "../../../../../src/components/MediaAnalyticsBridge/createMediaHelper.js";

describe("createMediaHelper", () => {
  let logger;
  let mediaHelper;
  beforeEach(() => {
    logger = {
      warn: vi.fn(),
    };
    mediaHelper = createMediaHelper({
      logger,
    });
  });
  describe("createMediaObject", () => {
    it("should return a valid media object when called with valid arguments", () => {
      const friendlyName = "testFriendlyName";
      const name = "testName";
      const length = 120;
      const mediaStreamType = "vod";
      const mediaType = "video";
      const expectedResult = {
        sessionDetails: {
          friendlyName,
          name,
          length,
          streamType: mediaType,
          contentType: mediaStreamType,
        },
      };
      const result = mediaHelper.createMediaObject(
        friendlyName,
        name,
        length,
        mediaStreamType,
        mediaType,
      );
      expect(result).toEqual(expectedResult);
    });
    it("should log a warning and return an empty object when validation fails", () => {
      const friendlyName = "";
      const name = "";
      const length = "invalid";
      const mediaStreamType = "";
      const mediaType = "";
      const expectedResult = {};
      const result = mediaHelper.createMediaObject(
        friendlyName,
        name,
        length,
        mediaStreamType,
        mediaType,
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
          offset: startTime,
          index: position,
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
          offset: startTime,
          length,
          index: position,
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
        timeToStart,
        framesPerSecond,
        droppedFrames,
      );
      expect(result).toEqual(expectedResult);
    });
    it("should log a warning and return an empty object when validation fails", () => {
      const bitrate = "invalid";
      const startupTime = "invalid";
      const fps = "invalid";
      const droppedFrames = "invalid";
      const expectedResult = {};
      const result = mediaHelper.createQoEObject(
        bitrate,
        startupTime,
        fps,
        droppedFrames,
      );
      expect(result).toEqual(expectedResult);
      expect(logger.warn).toHaveBeenCalled();
    });
  });
  describe("version", () => {
    it("should return the version", () => {
      const expectedResult = `WEBSDK __VERSION__`;
      const result = mediaHelper.version;
      expect(result).toEqual(expectedResult);
    });
  });
});
