/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createTaskQueue from "../../../../src/utils/createTaskQueue";
import { defer } from "../../../../src/utils";
import flushPromiseChains from "../../helpers/flushPromiseChains";

describe("createTaskQueue", () => {
  it("executes a single task once even when it throws an error", () => {
    const queue = createTaskQueue();
    const task1 = jasmine
      .createSpy("task1")
      .and.returnValue(Promise.reject(Error("myerror")));
    return queue.addTask(task1).then(fail, e => {
      expect(e.message).toEqual("myerror");
      expect(task1).toHaveBeenCalledTimes(1);
    });
  });

  it("executes tasks in sequence when first task succeeds", () => {
    const queue = createTaskQueue();
    const task1Deferred = defer();
    const task1 = jasmine
      .createSpy("task1")
      .and.returnValue(task1Deferred.promise);
    const task2Deferred = defer();
    const task2 = jasmine
      .createSpy("task2")
      .and.returnValue(task2Deferred.promise);

    const task1OnFulfilled = jasmine.createSpy("task1OnFulfilled");
    queue.addTask(task1).then(task1OnFulfilled);
    const task2OnFulfilled = jasmine.createSpy("task2OnFulfilled");
    queue.addTask(task2).then(task2OnFulfilled);

    return flushPromiseChains()
      .then(() => {
        expect(task1).toHaveBeenCalled();
        expect(task2).not.toHaveBeenCalled();
        expect(task1OnFulfilled).not.toHaveBeenCalled();
        expect(task2OnFulfilled).not.toHaveBeenCalled();
        task1Deferred.resolve("task1Result");
        return flushPromiseChains();
      })
      .then(() => {
        expect(task2).toHaveBeenCalled();
        expect(task1OnFulfilled).toHaveBeenCalledWith("task1Result");
        expect(task2OnFulfilled).not.toHaveBeenCalled();
        task2Deferred.resolve("task2Result");
        return flushPromiseChains();
      })
      .then(() => {
        expect(task2OnFulfilled).toHaveBeenCalledWith("task2Result");
      });
  });

  it("executes tasks in sequence when first task rejects promise", () => {
    const queue = createTaskQueue();
    const task1Deferred = defer();
    const task1 = jasmine
      .createSpy("task1")
      .and.returnValue(task1Deferred.promise);
    const task2Deferred = defer();
    const task2 = jasmine
      .createSpy("task2")
      .and.returnValue(task2Deferred.promise);

    const task1OnRejected = jasmine.createSpy("task1OnRejected");
    queue.addTask(task1).catch(task1OnRejected);
    const task2OnFulfilled = jasmine.createSpy("task2OnFulfilled");
    queue.addTask(task2).then(task2OnFulfilled);

    return flushPromiseChains()
      .then(() => {
        expect(task1).toHaveBeenCalled();
        expect(task2).not.toHaveBeenCalled();
        expect(task1OnRejected).not.toHaveBeenCalled();
        expect(task2OnFulfilled).not.toHaveBeenCalled();
        task1Deferred.reject(new Error("task1Error"));
        return flushPromiseChains();
      })
      .then(() => {
        expect(task2).toHaveBeenCalled();
        expect(task1OnRejected).toHaveBeenCalledWith(new Error("task1Error"));
        expect(task2OnFulfilled).not.toHaveBeenCalled();
        task2Deferred.resolve("task2Result");
        return flushPromiseChains();
      })
      .then(() => {
        expect(task2OnFulfilled).toHaveBeenCalledWith("task2Result");
      });
  });

  it("executes tasks in sequence when first task throws error", () => {
    const queue = createTaskQueue();
    const task1 = jasmine
      .createSpy("task1")
      .and.throwError(new Error("task1Error"));
    const task2Deferred = defer();
    const task2 = jasmine
      .createSpy("task2")
      .and.returnValue(task2Deferred.promise);

    const task1OnRejected = jasmine.createSpy("task1OnRejected");
    queue.addTask(task1).catch(task1OnRejected);
    const task2OnFulfilled = jasmine.createSpy("task2OnFulfilled");
    queue.addTask(task2).then(task2OnFulfilled);

    return flushPromiseChains()
      .then(() => {
        expect(task1).toHaveBeenCalled();
        expect(task2).toHaveBeenCalled();
        expect(task1OnRejected).toHaveBeenCalledWith(new Error("task1Error"));
        expect(task2OnFulfilled).not.toHaveBeenCalled();
        task2Deferred.resolve("task2Result");
        return flushPromiseChains();
      })
      .then(() => {
        expect(task2OnFulfilled).toHaveBeenCalledWith("task2Result");
      });
  });

  it("accurately reports the size of the queue", () => {
    const queue = createTaskQueue();
    const task1Deferred = defer();
    const task2Deferred = defer();
    expect(queue.length).toEqual(0);
    queue.addTask(() => task1Deferred.promise);
    expect(queue.length).toEqual(1);
    queue.addTask(() => task2Deferred.promise);
    expect(queue.length).toEqual(2);
    task1Deferred.resolve();
    return flushPromiseChains()
      .then(() => {
        expect(queue.length).toEqual(1);
        task2Deferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(queue.length).toEqual(0);
      });
  });
});
