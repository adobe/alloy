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
import toInteger from "./toInteger.js";

/**
 * Add padString to the start of the string until it reaches the target length
 *
 * Different from String.prototype.padStart because this function coerces the
 * input to a string before padding.
 * @param {any} string
 * @param {number} targetLength
 * @param {string} padString
 * @returns {string}
 */
const padStart = (string, targetLength, padString) => {
  return `${string}`.padStart(targetLength, padString);
};

/**
 * Formats the date into an ISO date-time string in the local timezone
 * @param {Date} date
 * @returns {string}
 */
export default (date) => {
  const YYYY = date.getFullYear();
  const MM = padStart(date.getMonth() + 1, 2, "0");
  const DD = padStart(date.getDate(), 2, "0");

  const hh = padStart(date.getHours(), 2, "0");
  const mm = padStart(date.getMinutes(), 2, "0");
  const ss = padStart(date.getSeconds(), 2, "0");
  const mmm = padStart(date.getMilliseconds(), 3, "0");

  // The time-zone offset is the difference, in minutes, from local time to UTC. Note that this
  // means that the offset is positive if the local timezone is behind UTC and negative if it is
  // ahead. For example, for time zone UTC+10:00, -600 will be returned.
  const timezoneOffset = toInteger(date.getTimezoneOffset(), 0);
  const ts = timezoneOffset > 0 ? "-" : "+";
  const th = padStart(Math.floor(Math.abs(timezoneOffset) / 60), 2, "0");
  const tm = padStart(Math.abs(timezoneOffset) % 60, 2, "0");

  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${mmm}${ts}${th}:${tm}`;
};
