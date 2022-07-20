export function triggerView(viewName) {
  if (typeof alloy === "function") {
    alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        web: {
          webPageDetails: {
            viewName: viewName,
          },
        },
      },
    });
  }
}
