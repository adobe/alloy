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
const pad = n => (n < 10 ? `0${n}` : n);

/**
 * Formats the date into an ISO date-time string in the local timezone
 * @param {Date} date
 * @returns {string}
 */
export default date => {
  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());

  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  // The time-zone offset is the difference, in minutes, from local time to UTC. Note that this
  // means that the offset is positive if the local timezone is behind UTC and negative if it is
  // ahead. For example, for time zone UTC+10:00, -600 will be returned.
  const timezoneOffset = date.getTimezoneOffset();
  const ts = timezoneOffset < 0 ? "+" : "-";
  const th = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const tm = pad(Math.abs(timezoneOffset) % 60);

  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${ts}${th}:${tm}`;
};
