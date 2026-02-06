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

/**
 * Sequences tasks.
 */
export default () => {
  let queueLength = 0;
  let lastPromiseInQueue = Promise.resolve();
  return {
    /**
     * Add a task to the queue. If no task is currenty running,
     * the task will begin immediately.
     * @param {Function} task A function that will be called when
     * the task should be run. If the task it asynchronous, it should
     * return a promise.
     * @returns {Promise} A promise that will be resolved or rejected
     * with whatever value the task resolved or rejects its promise.
     */
    addTask(task) {
      queueLength += 1;

      const lastPromiseFulfilledHandler = () => {
        return task().finally(() => {
          queueLength -= 1;
        });
      };

      lastPromiseInQueue = lastPromiseInQueue.then(
        lastPromiseFulfilledHandler,
        lastPromiseFulfilledHandler,
      );
      return lastPromiseInQueue;
    },
    /**
     * How many tasks are in the queue. This includes the task
     * that's currently running.
     * @returns {number}
     */
    get length() {
      return queueLength;
    },
  };
};
