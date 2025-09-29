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
const REFERENCE_EQUALITY = (a, b) => a === b;

const findIndex = (array, item, isEqual) => {
  for (let i = 0; i < array.length; i += 1) {
    if (isEqual(array[i], item)) {
      return i;
    }
  }
  return -1;
};

export default (array, isEqual = REFERENCE_EQUALITY) => {
  return array.filter(
    (item, index) => findIndex(array, item, isEqual) === index,
  );
};
