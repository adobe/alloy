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
export const TYPE_ERROR = "TypeError";
export const NETWORK_ERROR = "NetworkError";

/**
 * Checks if the error is a network-related error
 * @param {Error} error The error to check
 * @returns {boolean} True if the error is network-related
 */
export const isNetworkError = (error) => {
  return (
    error.name === TYPE_ERROR ||
    error.name === NETWORK_ERROR ||
    error.status === 0
  );
};
