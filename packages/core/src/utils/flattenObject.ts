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
type Indexable = Record<string, unknown>;

const isPlainObject = (obj: unknown): obj is Indexable =>
  obj !== null &&
  typeof obj === "object" &&
  Object.getPrototypeOf(obj) === Object.prototype;

const flattenObject = (
  obj: Indexable,
  result: Indexable = {},
  keys: string[] = [],
): Indexable => {
  Object.keys(obj).forEach((key) => {
    if (isPlainObject(obj[key]) || Array.isArray(obj[key])) {
      flattenObject(obj[key] as Indexable, result, [...keys, key]);
    } else {
      result[[...keys, key].join(".")] = obj[key];
    }
  });

  return result;
};

export default <T>(obj: T): T | Indexable => {
  if (!isPlainObject(obj)) {
    return obj;
  }

  return flattenObject(obj);
};
