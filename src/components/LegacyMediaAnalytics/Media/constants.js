export const MediaType = {
  Video: "video",
  Audio: "audio"
};
export const MediaObjectKey = {
  MediaResumed: "hasResume",
  GranularAdTracking: "media.granularadtracking"
};
export const StreamType = {
  VOD: "vod",
  Live: "live",
  Linear: "linear",
  Podcast: "podcast",
  Audiobook: "audiobook",
  AOD: "aod"
};
export const PlayerState = {
  FullScreen: "fullScreen",
  ClosedCaption: "closedCaptioning",
  Mute: "mute",
  PictureInPicture: "pictureInPicture",
  InFocus: "inFocus"
};

export const Event = {
  AdBreakStart: "adBreakStart",
  AdBreakComplete: "adBreakComplete",
  AdStart: "adStart",
  AdComplete: "adComplete",
  AdSkip: "adSkip",
  ChapterStart: "chapterStart",
  ChapterComplete: "chapterComplete",
  ChapterSkip: "chapterSkip",
  SeekStart: "seekStart",
  SeekComplete: "seekComplete",
  BufferStart: "bufferStart",
  BufferComplete: "bufferComplete",
  BitrateChange: "bitrateChange",
  StateStart: "stateStart",
  StateEnd: "stateEnd",
  SessionStart: "sessionStart",
  SessionEnd: "sessionEnd",
  Play: "play",
  Pause: "pauseStart"
};
export const VideoMetadataKeys = {
  Show: "show",
  Season: "season",
  Episode: "episode",
  AssetId: "assetID",
  Genre: "genre",
  FirstAirDate: "firstAirDate",
  FirstDigitalDate: "firstDigitalDate",
  Rating: "rating",
  Originator: "originator",
  Network: "network",
  ShowType: "showType",
  AdLoad: "adLoad",
  MVPD: "mvpd",
  Authorized: "authorized",
  DayPart: "dayPart",
  Feed: "feed",
  StreamFormat: "streamFormat"
};

export const AudioMetadataKeys = {
  Artist: "artist",
  Album: "album",
  Label: "label",
  Author: "author",
  Station: "station",
  Publisher: "publisher"
};

export const AdMetadataKeys = {
  Advertiser: "a.media.ad.advertiser",
  CampaignId: "a.media.ad.campaign",
  CreativeId: "a.media.ad.creative",
  PlacementId: "a.media.ad.placement",
  SiteId: "a.media.ad.site",
  CreativeUrl: "a.media.ad.creativeURL"
};
