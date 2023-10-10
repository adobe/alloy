const createThirdVideoPlayer = thirdVideoPlayerId => {
  const thirdVideoPlayer = document.getElementById(thirdVideoPlayerId);

  const thirdPlayerSettings = {
    playerName: "samplePlayerName",
    videoId: "123",
    videoName: "",
    videoLoaded: false,
    clock: null
  };

  return { thirdPlayerSettings, thirdVideoPlayer };
};

document.addEventListener("DOMContentLoaded", async function(event) {
  const { thirdPlayerSettings, thirdVideoPlayer } = createThirdVideoPlayer(
    "media-third-movie"
  );
  const mediaAnalyticsTracker = await window.alloy(
    "getMediaAnalyticsTracker",
    {}
  );
  const Media = mediaAnalyticsTracker.createMediaHelper();
  const trackerInstance = mediaAnalyticsTracker.getInstance();

  thirdVideoPlayer.addEventListener("playing", function() {
    console.log(
      "here is the player that will use legacy media analytics",
      thirdVideoPlayer
    );
    if (!thirdPlayerSettings.videoLoaded) {
      const mediaInfo = Media.createMediaObject(
        "NinasVideoName",
        "Ninas player video",
        12355,
        Media.StreamType.VOD,
        Media.MediaType.Video
      );
      const contextData = {
        isUserLoggedIn: "false",
        tvStation: "Sample TV station",
        programmer: "Sample programmer",
        assetID: "/uri-reference"
      };

      // Set standard Video Metadata
      contextData[Media.VideoMetadataKeys.Episode] = "Sample Episode";
      contextData[Media.VideoMetadataKeys.Show] = "Sample Show";

      trackerInstance.trackSessionStart(mediaInfo, contextData);

      thirdPlayerSettings.videoLoaded = true;

      thirdPlayerSettings.clock = setInterval(() => {
        trackerInstance.updatePlayhead(thirdVideoPlayer.currentTime);
      }, 1000);
    }
    trackerInstance.trackPlay();
  });

  thirdVideoPlayer.addEventListener("seeking", function() {
    console.log("seeking", thirdVideoPlayer);
  });
  thirdVideoPlayer.addEventListener("seeked", function() {
    console.log("seeked", thirdVideoPlayer);
  });
  thirdVideoPlayer.addEventListener("pause", function() {
    trackerInstance.trackPause();
  });

  thirdVideoPlayer.addEventListener("ended", function() {
    // reset player state
    trackerInstance.trackSessionEnd();
    clearInterval(thirdPlayerSettings.clock);
    thirdPlayerSettings.videoLoaded = false;
  });
});
