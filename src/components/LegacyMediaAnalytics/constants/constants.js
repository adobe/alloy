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

export const MEDIA_TYPE = {
  Video: "video",
  Audio: "audio"
};
export const STREAM_TYPE = {
  VOD: "vod",
  Live: "live",
  Linear: "linear",
  Podcast: "podcast",
  Audiobook: "audiobook",
  AOD: "aod"
};
export const PLAYER_STATE = {
  FullScreen: "fullScreen",
  ClosedCaption: "closedCaptioning",
  Mute: "mute",
  PictureInPicture: "pictureInPicture",
  InFocus: "inFocus"
};

export const EVENT = {
  /**
   * Constant defining event type for AdBreak start
   */
  AdBreakStart: "adBreakStart",
  /**
   * Constant defining event type for AdBreak complete
   */
  AdBreakComplete: "adBreakComplete",
  /**
   * Constant defining event type for Ad start
   */
  AdStart: "adStart",
  /**
   * Constant defining event type for Ad complete
   */
  AdComplete: "adComplete",
  /**
   * Constant defining event type for Ad skip
   */
  AdSkip: "adSkip",
  /**
   * Constant defining event type for Chapter start
   */
  ChapterStart: "chapterStart",
  /**
   * Constant defining event type for Chapter complete
   */
  ChapterComplete: "chapterComplete",
  /**
   * Constant defining event type for Chapter skip
   */
  ChapterSkip: "chapterSkip",
  /**
   * Constant defining event type for Seek start
   */
  SeekStart: "seekStart",
  /**
   * Constant defining event type for Seek complete
   */
  SeekComplete: "seekComplete",
  /**
   * Constant defining event type for Buffer start
   */
  BufferStart: "bufferStart",
  /**
   * Constant defining event type for Buffer complete
   */
  BufferComplete: "bufferComplete",
  /**
   * Constant defining event type for change in Bitrate
   */
  BitrateChange: "bitrateChange",
  /**
   * Constant defining event type for Custom State Start
   */
  StateStart: "stateStart",
  /**
   * Constant defining event type for Custom State End
   */
  StateEnd: "stateEnd"
};
export const MEDIA_EVENTS_INTERNAL = {
  SessionStart: "sessionStart",
  SessionEnd: "sessionEnd",
  SessionComplete: "sessionComplete",
  Play: "play",
  Pause: "pauseStart",
  Error: "error"
};

export const MEDIA_OBJECT_KEYS = {
  MediaResumed: "media.resumed",
  GranularAdTracking: "media.granularadtracking"
};

export const VIDEO_METADATA_KEYS = {
  Show: "a.media.show",
  Season: "a.media.season",
  Episode: "a.media.episode",
  AssetId: "a.media.asset",
  Genre: "a.media.genre",
  FirstAirDate: "a.media.airDate",
  FirstDigitalDate: "a.media.digitalDate",
  Rating: "a.media.rating",
  Originator: "a.media.originator",
  Network: "a.media.network",
  ShowType: "a.media.type",
  AdLoad: "a.media.adLoad",
  MVPD: "a.media.pass.mvpd",
  Authorized: "a.media.pass.auth",
  DayPart: "a.media.dayPart",
  Feed: "a.media.feed",
  StreamFormat: "a.media.format"
};

export const AUDIO_METADATA_KEYS = {
  Artist: "a.media.artist",
  Album: "a.media.album",
  Label: "a.media.label",
  Author: "a.media.author",
  Station: "a.media.station",
  Publisher: "a.media.publisher"
};

export const AD_METADATA_KEYS = {
  Advertiser: "a.media.ad.advertiser",
  CampaignId: "a.media.ad.campaign",
  CreativeId: "a.media.ad.creative",
  PlacementId: "a.media.ad.placement",
  SiteId: "a.media.ad.site",
  CreativeUrl: "a.media.ad.creativeURL"
};
