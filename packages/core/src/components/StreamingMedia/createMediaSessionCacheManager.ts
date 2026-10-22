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

import PlaybackState from "./constants/playbackState.js";

export type PlaybackStateValue =
  (typeof PlaybackState)[keyof typeof PlaybackState];

export interface PlayerDetails {
  playhead: unknown;
  qoeDataDetails?: Record<string, unknown>;
}

export type GetPlayerDetails = (options: { playerId: string }) => PlayerDetails;

/** What a media session request resolves to; see `createMediaResponseHandler`. */
export interface MediaSessionResult {
  sessionId?: string;
  [key: string]: unknown;
}

export interface MediaSessionDetails {
  sessionPromise: Promise<MediaSessionResult | undefined>;
  getPlayerDetails?: GetPlayerDetails;
  playbackState?: PlaybackStateValue;
  pingId?: ReturnType<typeof setTimeout> | null;
}

export interface MediaSessionCacheManager {
  getSession: (playerId: string) => Partial<MediaSessionDetails>;
  storeSession: (options: {
    playerId?: string;
    sessionDetails: MediaSessionDetails;
  }) => void;
  stopPing: (options: { playerId: string }) => void;
  savePing: (options: {
    playerId: string;
    pingId: ReturnType<typeof setTimeout>;
    playbackState: PlaybackStateValue | undefined;
  }) => void;
}

export default (): MediaSessionCacheManager => {
  // Unset until the first storeSession; the other methods assume it is set.
  let mediaSessionCache: Record<string, MediaSessionDetails>;

  const getSession = (playerId: string) => {
    return mediaSessionCache[playerId] || {};
  };

  const savePing: MediaSessionCacheManager["savePing"] = ({
    playerId,
    pingId,
    playbackState,
  }) => {
    if (!mediaSessionCache[playerId]) {
      return;
    }
    if (mediaSessionCache[playerId].pingId) {
      clearTimeout(mediaSessionCache[playerId].pingId);
    }

    mediaSessionCache[playerId].pingId = pingId;
    mediaSessionCache[playerId].playbackState = playbackState;
  };

  const stopPing: MediaSessionCacheManager["stopPing"] = ({ playerId }) => {
    const sessionDetails = mediaSessionCache[playerId];

    if (!sessionDetails) {
      return;
    }

    // clearTimeout ignores a null or undefined id.
    clearTimeout(sessionDetails.pingId as ReturnType<typeof setTimeout>);

    sessionDetails.pingId = null;
    sessionDetails.playbackState = PlaybackState.COMPLETED;
  };
  const storeSession: MediaSessionCacheManager["storeSession"] = ({
    playerId,
    sessionDetails,
  }) => {
    if (mediaSessionCache === undefined) {
      mediaSessionCache = {};
    }

    // A session without a playerId is stored under "undefined", as before.
    mediaSessionCache[playerId as string] = sessionDetails;
  };

  return {
    getSession,
    storeSession,
    stopPing,
    savePing,
  };
};
