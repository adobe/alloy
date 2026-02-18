/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// This function compares strings that may have numbers in them.
// It splits the string into numbers and non-numbers, then compares
// each piece one at a time.
const regex = /([^0-9]*)([0-9]*)/g;
const compare = new Intl.Collator().compare;

export default (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") {
    return compare(a, b);
  }
  const aIter = a.matchAll(regex);
  const bIter = b.matchAll(regex);

  let aMatch;
  let bMatch;
  let aText;
  let bText;
  let aNumber;
  let bNumber;
  let comparison;

  while (true) {
    ({ value: aMatch } = aIter.next());
    ({ value: bMatch } = bIter.next());
    // the last match from the regex is empty string
    if (aMatch[0] === "" || bMatch[0] === "") {
      return compare(aMatch[0], bMatch[0]);
    }
    aText = aMatch[1];
    bText = bMatch[1];
    comparison = compare(aText, bText);
    if (comparison !== 0) {
      return comparison;
    }
    aNumber = Number.parseInt(aMatch[2], 10);
    bNumber = Number.parseInt(bMatch[2], 10);
    comparison = aNumber - bNumber;
    if (comparison !== 0) {
      return comparison;
    }
  }
};
