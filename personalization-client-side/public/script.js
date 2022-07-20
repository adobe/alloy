function createIdentityPayload(
  id,
  authenticatedState = "ambiguous",
  primary = true
) {
  if (id.length === 0) {
    return undefined;
  }

  return {
    id,
    authenticatedState,
    primary,
  };
}

function sendDisplayEvent(decision) {
  const { id, scope, scopeDetails = {} } = decision;

  alloy("sendEvent", {
    xdm: {
      eventType: "decisioning.propositionDisplay",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: id,
              scope: scope,
              scopeDetails: scopeDetails,
            },
          ],
        },
      },
    },
  });
}

function updateButtons(buttonActions) {
  buttonActions.forEach((buttonAction) => {
    const { id, text, content } = buttonAction;

    const element = document.getElementById(`action-button-${id}`);
    element.innerText = text;

    element.addEventListener("click", () => alert(content));
  });
}

function applyPersonalization(decisionScopeName) {
  return function (result) {
    const { propositions = [], decisions = [] } = result;

    // send display event for the decision scope / target mbox
    decisions.forEach((decision) => sendDisplayEvent(decision));

    const mbox = propositions.find(
      (proposition) => proposition.scope === decisionScopeName
    );

    if (mbox) {
      const element = document.querySelector("img.target-offer");

      const {
        buttonActions = [],
        heroImageName = "demo-marketing-offer1-default.png",
      } = mbox.items[0].data.content;

      updateButtons(buttonActions);

      element.src = `img/${heroImageName}`;
    }
  };
}
