const createSecondVideoPlayer = secondVideoPlayerId => {
  const secondVideoPlayer = document.getElementById(secondVideoPlayerId);

  const secondPlayerSettings = {
    playerName: "samplePlayerName",
    videoId: "123",
    videoName: "",
    videoLoaded: false,
    clock: null
  };

  return { secondPlayerSettings, secondVideoPlayer };
};
const getDemoVideoPlayedPlayhead = secondVideoPlayer => {
  return secondVideoPlayer.currentTime;
};
const createSecondSampleEventsBasedOnPlayhead = ({
  secondVideoPlayer,
  sessionId
}) => {
  return () => {
    const playhead = getDemoVideoPlayedPlayhead(secondVideoPlayer);
    if (playhead > 1 && playhead < 2) {
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
            playhead: parseInt(playhead, 10)
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
            playhead: parseInt(playhead, 10)
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
          playhead: parseInt(playhead, 10)
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
            playhead: parseInt(playhead, 10)
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
            playhead: parseInt(playhead, 10)
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
            playhead: parseInt(playhead, 10)
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
            playhead: parseInt(playhead, 10)
          }
        }
      });
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.adBreakComplete",
          mediaCollection: {
            sessionID: sessionId,
            playhead: parseInt(playhead, 10)
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
            playhead: parseInt(playhead, 10)
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
            playhead: parseInt(playhead, 10)
          }
        }
      });
    }
  };
};
document.addEventListener("DOMContentLoaded", async function(event) {
  const { secondPlayerSettings, secondVideoPlayer } = createSecondVideoPlayer(
    "media-second-movie"
  );

  let sessionPromise;
  secondVideoPlayer.addEventListener("playing", function() {
    if (!secondPlayerSettings.videoLoaded) {
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
        .then(result => {
          const { sessionId } = result;
          const sampleDemoEventTriggerer = createSecondSampleEventsBasedOnPlayhead(
            { secondVideoPlayer, sessionId }
          );
          secondPlayerSettings.clock = setInterval(
            sampleDemoEventTriggerer,
            1000
          );
          return sessionId;
        })
        .catch(error => {
          console.log("error", error);
        });

      secondPlayerSettings.videoLoaded = true;
    }

    sessionPromise.then(sessionId => {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.play",
          mediaCollection: {
            playhead: parseInt(getDemoVideoPlayedPlayhead(this), 10),
            sessionID: sessionId
          }
        }
      });
    });
  });

  secondVideoPlayer.addEventListener("seeking", function() {
    console.log("seeking", secondVideoPlayer);
  });
  secondVideoPlayer.addEventListener("seeked", function() {
    console.log("seeked", secondVideoPlayer);
  });
  secondVideoPlayer.addEventListener("pause", function() {
    sessionPromise.then(sessionId => {
      window.alloy("sendMediaEvent", {
        xdm: {
          eventType: "media.pauseStart",
          mediaCollection: {
            playhead: parseInt(getDemoVideoPlayedPlayhead(this), 10),
            sessionID: sessionId
          }
        }
      });
    });
  });
  secondVideoPlayer.addEventListener("ended", function() {
    sessionPromise.then(sessionId => {
      window
        .alloy("sendMediaEvent", {
          xdm: {
            eventType: "media.sessionComplete",
            mediaCollection: {
              playhead: parseInt(getDemoVideoPlayedPlayhead(this), 10),
              sessionID: sessionId
            }
          }
        })
        .then(result => {
          console.log("sessionComplete result", result);
        });
    });
    // reset player state
    clearInterval(secondPlayerSettings.clock);
    secondPlayerSettings.videoLoaded = false;
  });
});
