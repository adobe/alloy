/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export const EVENT_HISTORY_MAX_RECORDS = 1000;
export const EVENT_HISTORY_RETENTION_PERIOD = 30; // 30 days
export const EVENT_HISTORY_STORAGE_KEY = "events";
export const EVENT_HISTORY_MAX_LENGTH = 2 * 1024 * 1024; // 2MB

export const CONTEXT_KEY = {
  TYPE: "~type",
  SOURCE: "~source",
};

export const CONTEXT_EVENT_TYPE = {
  LIFECYCLE: "com.adobe.eventType.lifecycle",
  TRACK: "com.adobe.eventType.generic.track",
  EDGE: "com.adobe.eventType.edge",
  RULES_ENGINE: "com.adobe.eventType.rulesEngine",
};

export const CONTEXT_EVENT_SOURCE = {
  LAUNCH: "com.adobe.eventSource.applicationLaunch",
  REQUEST: "com.adobe.eventSource.requestContent",
};

export const CJM_IN_APP_MESSAGE_TYPE = "cjmiam";
export const SCHEMA = "schema";

export const INSERT_OPERATION = "insert";
export const INSERT_IF_NOT_EXISTS_OPERATION = "insertIfNotExists";
