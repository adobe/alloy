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
import debounce from "../../../../src/utils/debounce";

describe("debounce", () => {
  let callback;

  beforeEach(() => {
    callback = jasmine.createSpy();
  });

  it("calls a function only once", done => {
    const fn = debounce(callback, 150);

    for (let i = 0; i < 10; i += 1) {
      fn("oh", "hai");
    }

    setTimeout(() => {
      expect(callback).toHaveBeenCalledOnceWith("oh", "hai");
      expect(callback).toHaveBeenCalledTimes(1);
      done();
    }, 160);
  });

  it("calls a function only once per delay period", done => {
    const fn = debounce(callback, 10);
    fn("oh", "hai");
    fn("oh", "hai");

    setTimeout(() => {
      fn("cool", "beans");
      expect(callback).toHaveBeenCalledWith("oh", "hai");
      expect(callback).toHaveBeenCalledTimes(1);
    }, 25);

    setTimeout(() => {
      expect(callback).toHaveBeenCalledWith("cool", "beans");
      expect(callback).toHaveBeenCalledTimes(2);
      done();
    }, 50);
  });
});
