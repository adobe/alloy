import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import useSendPageViewEvent from "./helpers/useSendPageViewEvent";

export default function Personalization() {
  useAlloy();
  useSendPageViewEvent({
    renderDecisions: true,
    xdm: {
      identityMap: {
        CRM_ID: [
          {
            id: "test-user-12345",
            primary: true,
            authenticatedState: "authenticated",
          },
        ],
      },
    },
  });

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Personalization</h1>
      <p>
        This page tests rendering of activities using a <i>__view__</i> scope.
        If you navigated here from another sandbox view, you will probably need
        to refresh your browser because this is how to properly simulate a
        non-SPA workflow.
      </p>
      <div style={{ border: "1px solid red" }} id="personalization-container">
        This is the personalization placeholder. Personalized content has not
        been loaded.
      </div>
    </div>
  );
}
