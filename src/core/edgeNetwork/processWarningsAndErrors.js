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

/**
 * Processes warnings and errors from a response object. If warnings are found,
 * they will be logged. If errors are found, an error will be thrown with information
 * about the errors received from the server.
 * @param {Object} response
 * @param {Object} logger
 */
export default (response, logger) => {
  // Regardless of whether the response had a successful status code,
  // the response payload may have warnings and errors we still
  // want to process.

  const warnings = response.getWarnings();
  const errors = response.getErrors();

  warnings.forEach(warning => {
    logger.warn(
      `Warning received from server: [Code ${warning.code}] ${warning.message}`
    );
  });

  if (errors.length) {
    const errorMessage = errors.reduce((memo, error) => {
      return `${memo}\n• [Code ${error.code}] ${error.message}`;
    }, "The server responded with the following errors:");
    throw new Error(errorMessage);
  }
};
