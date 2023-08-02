const createSecondsecvideoPlayer = secvideoPlayerId => {
  const secvideoPlayer = document.getElementById(secvideoPlayerId);
  const secplayerSettings = {
    playerName: "samplePlayerName",
    videoId: "123",
    videoName: "",
    videoLoaded: false,
    clock: null
  };

  return { secplayerSettings, secvideoPlayer };
};
const getdemoVideoPlayedPlayhead = secvideoPlayer => {
  return parseInt(secvideoPlayer.currentTime);
};
const createSecondSampleEventsBasedOnPlayhead = ({
  secvideoPlayer,
  sessionId
}) => {
  return () => {
    const playhead = getdemoVideoPlayedPlayhead(secvideoPlayer);
    if (playhead > 1 && playhead < 2) {
      console.log("chapter start");
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.chapterStart",
          mediaCollection: {
            chapterDetails: {
              friendlyName: "Chapter 1",
              length: 20,
              index: 1,
              offset: 0
            },
            sessionID: sessionId,
            playhead
          }
        }
      });
    }

    if (playhead > 20 && playhead < 21) {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.chapterComplete",
          mediaCollection: {
            sessionID: sessionId,
            playhead
          }
        }
      });
    }

    if (playhead > 21 && playhead < 22) {
      window.alloy("sendMediaEvent", {
        eventType: "media.adBreakStart",
        mediaCollection: {
          advertisingPodDetails: {
            friendlyName: "Mid-roll",
            offset: 0,
            index: 1
          },
          sessionID: sessionId,
          playhead
        }
      });
      window.alloy("sendMediaEvent", {
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
            },
            sessionID: sessionId,
            playhead
          }
        }
      });
    }

    if (playhead > 25 && playhead < 26) {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.adComplete",
          mediaCollection: {
            sessionID: sessionId,
            playhead
          }
        }
      });
    }

    if (playhead > 26 && playhead < 27) {
      window.alloy("sendMediaEvent", {
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
            },
            sessionID: sessionId,
            playhead
          }
        }
      });
    }

    if (playhead > 29 && playhead < 30) {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.adSkip",
          mediaCollection: {
            sessionID: sessionId,
            playhead
          }
        }
      });
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.adBreakComplete",
          mediaCollection: {
            sessionID: sessionId,
            playhead
          }
        }
      });
    }

    if (playhead > 30 && playhead < 31) {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.chapterStart",
          mediaCollection: {
            chapterDetails: {
              friendlyName: "Chapter 2",
              length: 30,
              index: 2,
              offset: 0
            },
            sessionID: sessionId,
            playhead
          }
        }
      });
    }

    if (playhead > 59 && playhead < 60) {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.chapterComplete",
          mediaCollection: {
            sessionID: sessionId,
            playhead
          }
        }
      });
    }
  };
};
document.addEventListener("DOMContentLoaded", async function(event) {
  const { secplayerSettings, secvideoPlayer } = createSecondsecvideoPlayer(
    "media-second-movie"
  );

  let sessionPromise;
  secvideoPlayer.addEventListener("playing", function() {
    if (!secplayerSettings.videoLoaded) {
      sessionPromise = window
        .alloy("createMediaSession", {
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
              },
              playhead: 0
            }
          }
        })
        .then(sessionId => {
          const sampleDemoEventTriggerer = createSecondSampleEventsBasedOnPlayhead(
            secvideoPlayer,
            sessionId
          );
          secplayerSettings.clock = setInterval(sampleDemoEventTriggerer, 1000);
          console.log("session Id for second movie", sessionId);
        });

      sessionPromise
        .then(result => {
          console.log("sesssionPromise result", result);
        })
        .catch(error => {
          console.log("error", error);
        });
      secplayerSettings.videoLoaded = true;
    }

    sessionPromise.then(sessionId => {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.play",
          mediaCollection: {
            playhead: getdemoVideoPlayedPlayhead(secvideoPlayer),
            sessionID: sessionId
          }
        }
      });
    });
  });
  secvideoPlayer.addEventListener("seeking", function() {
    console.log("seeking", secvideoPlayer);
  });
  secvideoPlayer.addEventListener("seeked", function() {
    console.log("seeked", secvideoPlayer);
  });
  secvideoPlayer.addEventListener("pause", function() {
    sessionPromise.then(sessionId => {
      window.alloy("sendMediaEvent", {
        playerId: "episode-1",
        xdm: {
          eventType: "media.pauseStart",
          mediaCollection: {
            playhead: getdemoVideoPlayedPlayhead(secvideoPlayer),
            sessionID: sessionId
          }
        }
      });
    });
  });
  secvideoPlayer.addEventListener("ended", function() {
    sessionPromise.then(sessionId => {
      window
        .alloy("sendMediaEvent", {
          xdm: {
            eventType: "media.sessionComplete",
            mediaCollection: {
              playhead: getdemoVideoPlayedPlayhead(secvideoPlayer),
              sessionID: sessionId
            }
          }
        })
        .then(result => {
          console.log("sessionComplete result", result);
        });
    });
    // reset player state
    clearInterval(secplayerSettings.clock);
    secplayerSettings.videoLoaded = false;
  });
});
