const createVideoPlayer = videoPlayerId => {
  const videoPlayer = document.getElementById(videoPlayerId);

  const playerSettings = {
    playerName: "samplePlayerName",
    videoId: "123",
    videoName: "",
    videoLoaded: false
  };

  return { playerSettings, videoPlayer };
};

const getVideoPlayedPlayhead = videoPlayer => {
  return videoPlayer.currentTime;
};

document.addEventListener("DOMContentLoaded", async function(event) {
  const mediaComponent = await window
    .alloy("getMediaAnalyticsTracker", {})
    .then(media => {
      return media;
    });

  const { playerSettings, videoPlayer } = createVideoPlayer("media-movie");
  const Media = mediaComponent.createMediaHelper();
  const tracker = mediaComponent.getInstance();
  let ticker;

  videoPlayer.addEventListener("playing", function() {
    if (!playerSettings.videoLoaded) {
      console.log(
        "playing session start",
        videoPlayer.currentTime,
        playerSettings
      );
      const mediaObject = Media.createMediaObject(
        "Sample VideoName",
        "123",
        16800,
        "video",
        "VOD"
      );
      const contextData = {
        isUserLoggedIn: "false",
        tvStation: "Sample TV station",
        programmer: "Sample programmer"
      };

      // Set standard Video Metadata
      contextData[Media.VideoMetadataKeys.Episode] = "Sample Episode";
      contextData[Media.VideoMetadataKeys.Show] = "Sample Show";

      console.log("mediaObject", mediaObject);
      tracker.trackSessionStart(mediaObject, contextData);
      playerSettings.videoLoaded = true;
      // register the ticker to update playhead after the session is started
      const updatePlayhead = () => {
        console.log("updating playhead");
        tracker.updatePlayhead(videoPlayer.currentTime);
      };
      ticker = setInterval(updatePlayhead, 1000);
    }
    const playhead = getVideoPlayedPlayhead(videoPlayer);

    // trigger play event
    // playerSettings.videoLoaded = true;
    console.log("playing", videoPlayer, playerSettings, playhead);

    tracker.trackPlay();
  });
  videoPlayer.addEventListener("seeking", function() {
    console.log("seeking", videoPlayer);
    tracker.trackEvent(Media.Event.SeekStart);
  });
  videoPlayer.addEventListener("seeked", function() {
    console.log("seeked", videoPlayer);
    tracker.trackEvent(Media.Event.SeekComplete);
  });
  videoPlayer.addEventListener("pause", function() {
    console.log("pause", videoPlayer);
    tracker.trackPause();
  });
  videoPlayer.addEventListener("ended", function() {
    console.log("ended session", videoPlayer);
    clearInterval(ticker);
    tracker.trackComplete();
  });
});
