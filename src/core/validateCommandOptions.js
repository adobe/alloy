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

const COMMAND_DOC_URI = "https://adobe.ly/2UH0qO7";

export default ({ command, options, logger }) => {
  const {
    commandName,
    documentationUri = COMMAND_DOC_URI,
    optionsValidator
  } = command;
  let validatedOptions = options;
  if (optionsValidator) {
    try {
      validatedOptions = optionsValidator({ options, logger });
    } catch (validationError) {
      const invalidOptionsMessage = `Invalid ${commandName} command options:\n\t - ${validationError}
      \nFor command documentation see: ${documentationUri}`;
      throw new Error(invalidOptionsMessage);
    }
  }
  return validatedOptions;
};
