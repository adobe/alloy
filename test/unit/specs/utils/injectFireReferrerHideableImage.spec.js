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

import injectFireReferrerHideableImage from "../../../../src/utils/injectFireReferrerHideableImage";

describe("injectFireReferrerHideableImage", () => {
  let appendNodeMock;
  let awaitSelectorMock;
  let createNodeMock;
  let fireImageMock;
  let removeNodeMock;
  let fireReferrerHideableImage;

  beforeEach(() => {
    appendNodeMock = jasmine
      .createSpy("appendNode")
      .and.callFake(() => ({ contentWindow: { document: {} } }));
    awaitSelectorMock = jasmine
      .createSpy("awaitSelector")
      .and.callFake(() => Promise.resolve(["body"]));
    createNodeMock = jasmine
      .createSpy("createNode")
      .and.callFake(() => ({ contentWindow: { document: {} } }));
    fireImageMock = jasmine
      .createSpy("fireImage")
      .and.callFake(() => Promise.resolve());
    removeNodeMock = jasmine.createSpy("removeNode");
    fireReferrerHideableImage = injectFireReferrerHideableImage({
      appendNode: appendNodeMock,
      awaitSelector: awaitSelectorMock,
      createNode: createNodeMock,
      fireImage: fireImageMock,
      removeNode: removeNodeMock
    });
  });

  it("should create an iframe for a request that hides the referrer", async () => {
    const request = {
      hideReferrer: true,
      url: "https://adobe.com/test-referrer.jpg"
    };
    await fireReferrerHideableImage(request);

    expect(createNodeMock).toHaveBeenCalled();
    expect(createNodeMock.calls.argsFor(0)).toContain("IFRAME");
    expect(fireImageMock).toHaveBeenCalled();
  });

  it("should fire the image on the page for a request that does not hide the referrer", async () => {
    const request = {
      hideReferrer: false,
      url: "https://adobe.com/test-referrer.jpg"
    };
    await fireReferrerHideableImage(request);

    expect(createNodeMock).not.toHaveBeenCalled();
    expect(fireImageMock).toHaveBeenCalled();
  });

  it("should destroy the iframe when firing the image fails", async () => {
    const request = {
      hideReferrer: true,
      url: "https://adobe.com/test-invalid-referrer.jpg"
    };
    fireImageMock.and.callFake(() =>
      Promise.reject(new Error("Expected failure"))
    );
    try {
      await fireReferrerHideableImage(request);
    } catch (err) {
      expect(createNodeMock).toHaveBeenCalled();
      expect(createNodeMock.calls.argsFor(0)).toContain("IFRAME");
      expect(fireImageMock).toHaveBeenCalled();
      expect(removeNodeMock).toHaveBeenCalled();
    }
  });

  it("should only create one iframe when called multiple times", async () => {
    const request = {
      hideReferrer: true,
      url: "https://adobe.com/test-invalid-referrer.jpg"
    };
    const secondRequest = {
      hideReferrer: true,
      url: "https://adobe.com/test-invalid-referrer2.jpg"
    };

    await fireReferrerHideableImage(request);
    await fireReferrerHideableImage(secondRequest);

    expect(createNodeMock).toHaveBeenCalledTimes(1);
    expect(createNodeMock.calls.argsFor(0)).toContain("IFRAME");
    expect(fireImageMock).toHaveBeenCalledTimes(2);
    expect(removeNodeMock).not.toHaveBeenCalled();
  });
});
