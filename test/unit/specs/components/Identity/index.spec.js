/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createIdentity from "../../../../../src/components/Identity";
import flushPromiseChains from "../../../helpers/flushPromiseChains";
import { EXPERIENCE_CLOUD_ID } from "../../../../../src/components/Identity/constants/cookieNames";

describe("Identity", () => {
  describe("reactor-specific functionality", () => {
    let identity;
    let reactorRegisterGetEcid;
    beforeEach(() => {
      reactorRegisterGetEcid = jasmine.createSpy();

      identity = createIdentity({
        config: {
          reactorRegisterGetEcid
        },
        cookieJar: {
          get(key) {
            return key === "ECID" ? "ABC" : null;
          }
        }
      });
    });

    describe("getEcid", () => {
      it("returns ECID when user is opted in", () => {
        identity.lifecycle.onComponentsRegistered({
          optIn: {
            isOptedIn() {
              return true;
            }
          }
        });

        const getEcid = reactorRegisterGetEcid.calls.first().args[0];
        expect(getEcid()).toBe("ABC");
      });

      it("returns undefined when user is not opted in", () => {
        identity.lifecycle.onComponentsRegistered({
          optIn: {
            isOptedIn() {
              return false;
            }
          }
        });

        const getEcid = reactorRegisterGetEcid.calls.first().args[0];
        expect(getEcid()).toBeUndefined();
      });
    });

    describe("onResponse", () => {
      let cookieJar;
      let response;
      beforeEach(() => {
        cookieJar = {
          get(key) {
            return key === "ECID" ? "ABC" : null;
          },
          set: jasmine.createSpy()
        };
        response = {
          getPayloadsByType: jasmine
            .createSpy()
            .and.returnValue([{ id: "ABC" }]),
          toJSON: jasmine.createSpy()
        };

        identity = createIdentity({
          config: {
            reactorRegisterGetEcid
          },
          cookieJar
        });
        identity.lifecycle.onComponentsRegistered({
          optIn: {
            whenOptedIn() {
              return Promise.resolve();
            }
          }
        });
      });
      it("should get called with an object with a property named response in it", () => {
        identity.lifecycle.onResponse({ response });
        return flushPromiseChains().then(() => {
          expect(response.getPayloadsByType).toHaveBeenCalledWith(
            "identity:persist"
          );
          expect(cookieJar.set).toHaveBeenCalledWith(
            EXPERIENCE_CLOUD_ID,
            "ABC"
          );
          expect(response.getPayloadsByType).toHaveBeenCalledWith(
            "identity:exchange"
          );
        });
      });
      it("should not set ECID if the response doesn't have id", () => {
        response = {
          getPayloadsByType: jasmine.createSpy().and.returnValue([]),
          toJSON: jasmine.createSpy()
        };
        identity = createIdentity({
          config: {
            reactorRegisterGetEcid
          },
          cookieJar
        });
        identity.lifecycle.onComponentsRegistered({
          optIn: {
            whenOptedIn() {
              return Promise.resolve();
            }
          }
        });
        identity.lifecycle.onResponse({ response });
        return flushPromiseChains().then(() => {
          expect(cookieJar.set).not.toHaveBeenCalled();
        });
      });
    });
  });
});
