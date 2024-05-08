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
import injectDevice from "../../../../../src/components/Context/injectDevice.js";

describe("Context::injectDevice", () => {
  let window;

  beforeEach(() => {
    window = {
      screen: {
        width: 600,
        height: 800
      }
    };
  });

  const run = () => {
    const xdm = {};
    injectDevice(window)(xdm);
    return xdm;
  };

  it("handles the happy path", () => {
    window.screen.orientation = { type: "landscape-primary" };
    expect(run()).toEqual({
      device: {
        screenHeight: 800,
        screenWidth: 600,
        screenOrientation: "landscape"
      }
    });
  });

  it("handles portrait orientation type", () => {
    window.screen.orientation = { type: "portrait-secondary" };
    expect(run()).toEqual({
      device: {
        screenHeight: 800,
        screenWidth: 600,
        screenOrientation: "portrait"
      }
    });
  });

  it("handles matchMedia queries: portrait", () => {
    window.matchMedia = query => ({
      matches: query === "(orientation: portrait)"
    });
    expect(run()).toEqual({
      device: {
        screenHeight: 800,
        screenWidth: 600,
        screenOrientation: "portrait"
      }
    });
  });

  it("handles matchMedia queries: landscape", () => {
    window.matchMedia = query => ({
      matches: query === "(orientation: landscape)"
    });
    expect(run()).toEqual({
      device: {
        screenHeight: 800,
        screenWidth: 600,
        screenOrientation: "landscape"
      }
    });
  });

  it("handles string values for the height and width", () => {
    window = {
      screen: {
        width: "600",
        height: "800"
      }
    };
    expect(run()).toEqual({
      device: {
        screenHeight: 800,
        screenWidth: 600
      }
    });
  });
  it("handles no good values", () => {
    window = {
      screen: {
        width: null,
        height: undefined
      }
    };
    expect(run()).toEqual({});
  });

  [
    undefined,
    null,
    {},
    { type: "foo" },
    { type: "a-b" },
    { type: null }
  ].forEach(orientation => {
    it(`handles a bad screen orientation: ${JSON.stringify(
      orientation
    )}`, () => {
      if (orientation !== undefined) {
        window.screen.orientation = orientation;
      }
      window.matchMedia = () => ({ matches: false });
      expect(run()).toEqual({
        device: {
          screenHeight: 800,
          screenWidth: 600
        }
      });
    });
  });
});
