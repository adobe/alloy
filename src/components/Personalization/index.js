
export default function Personalization() {
    Object.defineProperty(this, "namespace", { get() { return "Personalization" } });
    
    // IMPLEMENT THE HOOKS YOU ARE INTERESTED IN.

    this.onBeforeInteract = (payload) => {
        console.log("Personalization:::onBeforeInteract");
        payload.appendToQuery({
            personalization: {
                sessionId: "1234235"
            }
        });
    };

    this.onInteractResponse = ({ resources: { personalization = [] } } = {}) => {
        console.log("Personalization:::onInteractResponse");
        
        document.addEventListener("DOMContentLoaded", function(event) {
            personalization.forEach(offer => {
                const el = document.querySelector(offer.offerMboxSelector);
                if (el) {
                    el.innerHTML = offer.offerHtmlPayload;
                }
            });
        });
    };
}
