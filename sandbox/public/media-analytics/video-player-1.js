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
  const { playerSettings, videoPlayer } = createVideoPlayer("media-movie");

  let sessionPromise;
  videoPlayer.addEventListener("playing", function() {
    if (!playerSettings.videoLoaded) {
      sessionPromise = window.alloy("createMediaSession", {
        // start media session
        playerId: "episode-1",
        xdm: {
          eventType: "media.sessionStart",
          mediaCollection: {
            sessionDetails: {
              dayPart: "dayPart",
              mvpd: "test-mvpd",
              authorized: "true",
              label: "test-label",
              station: "test-station",
              publisher: "test-media-publisher",
              author: "test-author",
              name: "Friends",
              friendlyName: "FriendlyName",
              assetID: "/uri-reference",
              originator: "David Crane and Marta Kauffman",
              episode: "4933",
              genre: "Comedy",
              rating: "4.8/5",
              season: "1521",
              show: "Friends Series",
              length: 100,
              firstDigitalDate: "releaseDate",
              artist: "test-artist",
              hasResume: false,
              album: "test-album",
              firstAirDate: "firstAirDate",
              showType: "sitcom",
              streamFormat: "streamFormat",
              streamType: "video",
              adLoad: "adLoadType",
              channel: "broadcastChannel",
              contentType: "VOD",
              feed: "sourceFeed",
              network: "test-network"
            }
          }
        },
        onBeforeMediaEvent: () => {
          const getPlayhead = getVideoPlayedPlayhead(videoPlayer);
          return {
            playhead: getPlayhead
          };
        }
      });
      console.log("session Id", sessionPromise);

      sessionPromise
        .then(result => {
          console.log("sesssion", result);
        })
        .catch(error => {
          console.log("error", error);
        });
      playerSettings.videoLoaded = true;
    }

    window.alloy("sendMediaEvent", {
      playerId: "episode-1",
      //  type: "play",
      xdm: {
        eventType: "media.play",
        mediaCollection: {
        //  playhead: 0
          // sessionID: result.sessionId
        }
      }
    });
  });
  videoPlayer.addEventListener("seeking", function() {
    console.log("seeking", videoPlayer);
  });
  videoPlayer.addEventListener("seeked", function() {
    console.log("seeked", videoPlayer);
  });
  videoPlayer.addEventListener("pause", function() {
    // console.log("pause", videoPlayer, session);
    // session.then(result => {
    window.alloy("sendMediaEvent", {
      playerId: "episode-1",
      xdm: {
        eventType: "media.pauseStart",
        mediaCollection: {
          playhead: 0
          // sessionID: result.sessionId
        }
      }
    });
    // });
  });
  videoPlayer.addEventListener("ended", function() {
    // session.then(result => {
    window.alloy("sendMediaEvent", {
      playerId: "episode-1",
      xdm: {
        eventType: "media.sessionComplete",
        mediaCollection: {
          playhead: 0
          // sessionID: result.sessionId
        }
      }
    });
  });
  // });
});
