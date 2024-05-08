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
import injectGetLocationHint from "../../../../../src/core/edgeNetwork/injectGetLocationHint.js";

describe("injectGetLocationHint", () => {
  let cookieJar;
  let orgId;
  let getLocationHint;

  beforeEach(() => {
    cookieJar = jasmine.createSpyObj("cookieJar", ["get"]);
    orgId = "myorg@AdobeOrg";
    getLocationHint = injectGetLocationHint({ orgId, cookieJar });
  });

  it("returns the cluster cookie", () => {
    cookieJar.get.and.returnValue("mycluster");
    expect(getLocationHint()).toEqual("mycluster");
  });

  it("generates the correct cookie name", () => {
    cookieJar.get.and.returnValue("mycluster");
    getLocationHint();
    expect(cookieJar.get).toHaveBeenCalledOnceWith(
      "kndctr_myorg_AdobeOrg_cluster"
    );
  });

  it("doesn't cache the result", () => {
    cookieJar.get.and.returnValues("cluster1", "cluster2");
    expect(getLocationHint()).toEqual("cluster1");
    expect(getLocationHint()).toEqual("cluster2");
  });

  it("returns mbox edge cluster cookie", () => {
    cookieJar.get.and.returnValues(undefined, "35");
    expect(getLocationHint()).toEqual("t35");
  });

  it("returns undefined", () => {
    expect(getLocationHint()).toBeUndefined();
  });
});
