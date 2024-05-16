const createThirdVideoPlayer = (thirdVideoPlayerId) => {
  const thirdVideoPlayer = document.getElementById(thirdVideoPlayerId);

  const thirdPlayerSettings = {
    playerName: "samplePlayerName",
    videoId: "123",
    videoName: "",
    videoLoaded: false,
    clock: null,
  };

  return { thirdPlayerSettings, thirdVideoPlayer };
};

const createAddSampleEventsBasedOnVideoPlayhead = ({
  trackerInstance,
  Media,
  videoPlayer,
}) => {
  const playhead = videoPlayer.currentTime;
  if (playhead > 1 && playhead < 2) {
    const chapterContextData = {
      segmentType: "Sample segment type",
    };
    const chapterInfo = Media.createChapterObject("chapterNumber1", 2, 18, 1);
    trackerInstance.trackEvent(
      Media.Event.ChapterStart,
      chapterInfo,
      chapterContextData,
    );
  }

  if (playhead > 20 && playhead < 21) {
    trackerInstance.trackEvent(Media.Event.ChapterComplete);
  }

  if (playhead > 21 && playhead < 22) {
    const adBreakInfo = Media.createAdBreakObject("addBreakName", 12, 12);
    const adInfo = Media.createAdObject("firstAdd", "123", 10, 10);

    const adContextData = {
      affiliate: "Sample affiliate",
      campaign: "Sample ad campaign",
    };

    // Set standard Ad Metadata
    adContextData[Media.AdMetadataKeys.Advertiser] = "Sample Advertiser";
    adContextData[Media.AdMetadataKeys.CampaignId] = "Sample Campaign";

    trackerInstance.trackEvent(Media.Event.AdBreakStart, adBreakInfo);
    trackerInstance.trackEvent(Media.Event.AdStart, adInfo, adContextData);
  }

  if (playhead > 25 && playhead < 26) {
    trackerInstance.trackEvent(Media.Event.AdComplete);
  }

  if (playhead > 26 && playhead < 27) {
    const secondAdInfo = Media.createAdObject("secondAdd", "hjui", 10, 10);

    const adContextData = {
      affiliate: "Sample affiliate 2",
      campaign: "Sample ad campaign 2",
    };

    // Set standard Ad Metadata
    adContextData[Media.AdMetadataKeys.Advertiser] = "Sample Advertiser 2";
    adContextData[Media.AdMetadataKeys.CampaignId] = "Sample Campaign 2";
    trackerInstance.trackEvent(
      Media.Event.AdStart,
      secondAdInfo,
      adContextData,
    );
  }

  if (playhead > 29 && playhead < 30) {
    trackerInstance.trackEvent(Media.Event.AdSkip);
    trackerInstance.trackEvent(Media.Event.AdBreakComplete);
  }
};

document.addEventListener("DOMContentLoaded", async function (event) {
  const { thirdPlayerSettings, thirdVideoPlayer } =
    createThirdVideoPlayer("media-third-movie");
  const Media = await window.alloy("getMediaAnalyticsTracker", {});
  console.log("Media", Media);
  const trackerInstance = Media.getInstance();
  const trackerInstance2 = Media.getInstance();
  console.log("trackerInstance2", trackerInstance2);
  thirdVideoPlayer.addEventListener("playing", function () {
    const mediaInfo = Media.createMediaObject(
      "NinasVideoName",
      "Ninas player video",
      60,
      Media.StreamType.VOD,
      Media.MediaType.Video,
    );
    if (!thirdPlayerSettings.videoLoaded) {
      const contextData = {
        isUserLoggedIn: "false",
        tvStation: "Sample TV station",
        programmer: "Sample programmer",
        assetID: "/uri-reference",
      };

      // Set standard Video Metadata
      contextData[Media.VideoMetadataKeys.Episode] = "Sample Episode";
      contextData[Media.VideoMetadataKeys.Show] = "Sample Show";

      trackerInstance.trackSessionStart(mediaInfo, contextData);
      trackerInstance2.trackSessionStart(mediaInfo, contextData);
      trackerInstance.trackEvent(Media.Event.BufferStart);
      trackerInstance.trackEvent(Media.Event.BufferComplete);
      // StateStart (ex: Mute is switched on)
      const stateObject = Media.createStateObject(Media.PlayerState.Mute);
      console.log("stateObject", stateObject);
      trackerInstance.trackEvent(Media.Event.StateStart, stateObject);

      // StateEnd (ex: Mute is switched off)
      trackerInstance.trackEvent(Media.Event.StateEnd, stateObject);

      const qoeObject = Media.createQoEObject(1000000, 24, 25, 10);
      trackerInstance.updateQoEObject(qoeObject);
      thirdPlayerSettings.videoLoaded = true;
      trackerInstance.trackEvent(window.Media.Event.BitrateChange);

      thirdPlayerSettings.clock = setInterval(() => {
        trackerInstance.updatePlayhead(thirdVideoPlayer.currentTime);
        createAddSampleEventsBasedOnVideoPlayhead({
          trackerInstance,
          Media,
          videoPlayer: thirdVideoPlayer,
        });
      }, 1000);
    } else {
      trackerInstance.trackPlay();
    }
  });

  thirdVideoPlayer.addEventListener("seeking", function () {
    console.log("seeking", thirdVideoPlayer);
  });
  thirdVideoPlayer.addEventListener("seeked", function () {
    console.log("seeked", thirdVideoPlayer);
  });
  thirdVideoPlayer.addEventListener("pause", function () {
    trackerInstance.trackPause();
  });

  thirdVideoPlayer.addEventListener("ended", function () {
    // reset player state
    trackerInstance.trackSessionEnd();
    clearInterval(thirdPlayerSettings.clock);
    thirdPlayerSettings.videoLoaded = false;
  });
});
