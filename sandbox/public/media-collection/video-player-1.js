const createVideoPlayer = videoPlayerId => {
  const videoPlayer = document.getElementById(videoPlayerId);
  const playerSettings = {
    playerName: "samplePlayerName",
    videoId: "123",
    videoName: "",
    videoLoaded: false,
    clock: null
  };

  return { playerSettings, videoPlayer };
};

const getVideoPlayedPlayhead = videoPlayer => {
  return videoPlayer.currentTime;
};
const createAddSampleEventsBasedOnPlayhead = videoPlayer => {
  return () => {
    const playhead = getVideoPlayedPlayhead(videoPlayer);
    if (playhead > 1 && playhead < 2) {
      console.log("chapter start");
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.chapterStart",
          mediaCollection: {
            chapterDetails: {
              friendlyName: "Chapter 1",
              length: 20,
              index: 1,
              offset: 0
            }
          }
        }
      });
    }

    if (playhead > 20 && playhead < 21) {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.chapterComplete"
        }
      });
    }

    if (playhead > 21 && playhead < 22) {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.adBreakStart",
          mediaCollection: {
            advertisingPodDetails: {
              friendlyName: "Mid-roll",
              offset: 0,
              index: 1
            }
          }
        }
      });
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.adStart",
          mediaCollection: {
            advertisingDetails: {
              friendlyName: "Ad 1",
              name: "/uri-reference/001",
              length: 10,
              advertiser: "Adobe Marketing",
              campaignID: "Adobe Analytics",
              creativeID: "creativeID",
              creativeURL: "https://creativeurl.com",
              placementID: "placementID",
              siteID: "siteID",
              podPosition: 11,
              playerName: "HTML5 player" // ?? why do we have it here as well? same as the one from session start event?
            }
          }
        }
      });
    }

    if (playhead > 25 && playhead < 26) {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.adComplete"
        }
      });
    }

    if (playhead > 26 && playhead < 27) {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.adStart",
          mediaCollection: {
            advertisingDetails: {
              friendlyName: "Ad 2",
              name: "/uri-reference/002",
              length: 10,
              advertiser: "Adobe Marketing 2",
              campaignID: "Adobe Analytics 2",
              creativeID: "creativeID2",
              creativeURL: "https://creativeurl.com",
              placementID: "placementID",
              siteID: "siteID",
              podPosition: 17,
              playerName: "HTML5 player" // ?? why do we have it here as well? same as the one from session start event?
            }
          }
        }
      });
    }

    if (playhead > 29 && playhead < 30) {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.adSkip"
        }
      });
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.adBreakComplete"
        }
      });
    }

    if (playhead > 30 && playhead < 31) {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.chapterStart",
          mediaCollection: {
            chapterDetails: {
              friendlyName: "Chapter 2",
              length: 30,
              index: 2,
              offset: 0
            }
          }
        }
      });
    }

    if (playhead > 59 && playhead < 60) {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.chapterComplete"
        }
      });
    }
  };
};
document.addEventListener("DOMContentLoaded", async function(event) {
  const { playerSettings, videoPlayer } = createVideoPlayer("media-movie");

  let sessionPromise;
  videoPlayer.addEventListener("playing", function() {
    if (!playerSettings.videoLoaded) {
      sessionPromise = window
        .alloy("createMediaSession", {
          // start media session
          playerId: "episode-1", // unique identifier
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
                length: 60,
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
          getPlayerDetails: () => {
            const getPlayhead = getVideoPlayedPlayhead(videoPlayer);
            return {
              playhead: getPlayhead
            };
          }
        })
        .then(sessionId => {
          const sampleDemoEventTriggerer = createAddSampleEventsBasedOnPlayhead(
            videoPlayer
          );
          playerSettings.clock = setInterval(sampleDemoEventTriggerer, 1000);

          return sessionId;
        });

      sessionPromise
        .then(result => {
          console.log("sessionPromise result", result);
        })
        .catch(error => {
          console.log("error", error);
        });
      playerSettings.videoLoaded = true;
    }

    window.alloy("sendMediaEvent", {
      playerId: "episode-1",
      xdm: {
        eventType: "media.play"
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
        eventType: "media.pauseStart"
      }
    });
    // });
  });
  videoPlayer.addEventListener("ended", function() {
    // session.then(result => {
    window
      .alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.sessionComplete"
        }
      })
      .then(result => {
        console.log("sessionComplete result", result);
      });

    // reset player state
    clearInterval(playerSettings.clock);
    playerSettings.videoLoaded = false;
  });
});
