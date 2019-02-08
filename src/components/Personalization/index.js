import Core from "../Core";

function PersonalizationQuery(payload, sessionId) {
    this.build = function () {
        payload.appendToQuery({
            personalization: {
                sessionId: sessionId
            }
        });
    };
}

export default class Personalization {
    constructor() {
        
    }

    get namespace() {
        return "Personalization";
    }

    // IMPLEMENT THE HOOKS YOU ARE INTERESTED IN.

    onInteractRequest(payload) {
        console.log("Personalization:::onInteractRequest");
        const pbuilder = new PersonalizationQuery(payload, "1234235");
        return pbuilder.build();
    }

    onResponseReady({ personalization = []} = {}) {
        console.log("Personalization:::onResponseReady");
        
        document.addEventListener("DOMContentLoaded", function(event) {
            personalization.forEach(offer => {
                const el = document.querySelector(offer.offerMboxSelector);
                if (el) {
                    el.innerHTML = offer.offerHtmlPayload;
                }
            });
        });
    }
}
