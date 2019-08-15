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
import zFill from "./zFill";

/**
 * Formats the date into an ISO date-time string in the local timezone
 * @param {Date} date
 * @returns {string}
 */
export default date => {
  const YYYY = date.getFullYear();
  const MM = zFill(date.getMonth() + 1, 2);
  const DD = zFill(date.getDate(), 2);

  const hh = zFill(date.getHours(), 2);
  const mm = zFill(date.getMinutes(), 2);
  const ss = zFill(date.getSeconds(), 2);
  const mmm = zFill(date.getMilliseconds(), 3);

  // The time-zone offset is the difference, in minutes, from local time to UTC. Note that this
  // means that the offset is positive if the local timezone is behind UTC and negative if it is
  // ahead. For example, for time zone UTC+10:00, -600 will be returned.
  const timezoneOffset = date.getTimezoneOffset();
  const ts = timezoneOffset > 0 ? "-" : "+";
  const th = zFill(Math.floor(Math.abs(timezoneOffset) / 60), 2);
  const tm = zFill(Math.abs(timezoneOffset) % 60, 2);

  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${mmm}${ts}${th}:${tm}`;
};
