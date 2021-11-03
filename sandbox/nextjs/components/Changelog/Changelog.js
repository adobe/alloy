import React from "react";

const Changelog = () => {
  return (
    <>
      <h2 id="version-2-6-4-september-7-2021">
        Version 2.6.4 - September 7, 2021
      </h2>
      <ul>
        <li>
          Fixed an issue where set HTML Adobe Target actions applied to the{" "}
          <code>head</code> element were replacing the entire <code>head</code>{" "}
          content. Now set HTML actions applied to the <code>head</code> element
          are changed to append HTML.
        </li>
      </ul>
      <h2 id="version-2-6-3-august-16-2021">Version 2.6.3 - August 16, 2021</h2>
      <ul>
        <li>
          Fixed an issue where objects not intended for public use were exposed
          through the resolved promise from the <code>configure</code> command.
        </li>
      </ul>
      <h2 id="version-2-6-2-august-4-2021">Version 2.6.2 - August 4, 2021</h2>
      <ul>
        <li>
          Fixed an issue where a warning about the deprecation of{" "}
          <code>result.decisions</code> (provided by the <code>sendEvent</code>{" "}
          command) would be logged to the console even when the{" "}
          <code>result.decisions</code> property wasn&#39;t being accessed. No
          warning will be logged when accessing the{" "}
          <code>result.decisions</code> property, but the property is still
          deprecated.
        </li>
      </ul>
      <h2 id="version-2-6-1-july-29-2021">Version 2.6.1 - July 29, 2021</h2>
      <ul>
        <li>
          Fixed an issue where rendering personalization for a single-page app
          view that has no personalization content would throw an error and
          cause the promise returned from the <code>sendEvent</code> command to
          be rejected.
        </li>
      </ul>
      <h2 id="version-2-6-0-july-27-2021">Version 2.6.0 - July 27, 2021</h2>
      <ul>
        <li>
          Provides more personalization content in the <code>sendEvent</code>{" "}
          resolved promise, including Adobe Target response tokens. When the{" "}
          <code>sendEvent</code> command is executed, a promise is returned,
          which is eventually resolved with a <code>result</code> object
          containing information received from the server. Previously, this
          result object included a property named <code>decisions</code>. This{" "}
          <code>decisions</code> property has been deprecated. A new property,{" "}
          <code>propositions</code>, has been added. This new property provides
          customers with access to more personalization content, including{" "}
          <a href="https://experienceleague.adobe.com/docs/experience-platform/edge/personalization/adobe-target/accessing-response-tokens.html">
            response tokens
          </a>
          .
        </li>
      </ul>
      <h2 id="version-2-5-0-june-2021">Version 2.5.0 - June 2021</h2>
      <ul>
        <li>Added support for redirect personalization offers.</li>
        <li>
          Automatically collected viewport widths and heights that are negative
          values will no longer be sent to the server.
        </li>
        <li>
          When an event is canceled by returning <code>false</code> from an{" "}
          <code>onBeforeEventSend</code> callback, a message is now logged.
        </li>
        <li>
          Fixed an issue where specific pieces of XDM data intended for a single
          event was included across multiple events.
        </li>
      </ul>
      <h2 id="version-2-4-0-march-2021">Version 2.4.0 - March 2021</h2>
      <ul>
        <li>
          The SDK can now be{" "}
          <a href="https://experienceleague.adobe.com/docs/experience-platform/edge/fundamentals/installing-the-sdk.html">
            installed as an npm package
          </a>
          .
        </li>
        <li>
          Added support for an <code>out</code> option when{" "}
          <a href="https://experienceleague.adobe.com/docs/experience-platform/edge/fundamentals/configuring-the-sdk.html#default-consent">
            configuring default consent
          </a>
          , which drops all events until consent is received (the existing{" "}
          <code>pending</code> option queues events and sends them once consent
          is received).
        </li>
        <li>
          The{" "}
          <a href="https://experienceleague.adobe.com/docs/experience-platform/edge/fundamentals/configuring-the-sdk.html#onbeforeeventsend">
            onBeforeEventSend callback
          </a>{" "}
          can now be used to prevent an event from being sent.
        </li>
        <li>
          Now uses an XDM schema field group instead of{" "}
          <code>meta.personalization</code> when sending events about
          personalized content being rendered or clicked.
        </li>
        <li>
          The{" "}
          <a href="https://experienceleague.adobe.com/docs/experience-platform/edge/identity/overview.html#retrieving-the-visitor-id">
            getIdentity command
          </a>{" "}
          now returns the edge region ID alongside the identity.
        </li>
        <li>
          Warnings and errors received from the server have been improved and
          are handled in a more appropriate fashion.
        </li>
        <li>
          Added support for{" "}
          <a href="https://experienceleague.adobe.com/docs/experience-platform/edge/consent/supporting-consent.html?communicating-consent-preferences-via-the-adobe-standard">
            Adobe&#39;s Consent 2.0 standard
          </a>
          .
        </li>
        <li>
          Consent preferences, when received, are hashed and stored in local
          storage for an optimized integration among CMPs, Platform Web SDK, and
          Platform Edge Network. If you are collecting consent preferences, we
          now encourage you to call <code>setConsent</code> on every page load.
        </li>
        <li>
          Two{" "}
          <a href="https://github.com/adobe/alloy/wiki/Monitoring-Hooks">
            monitoring hooks
          </a>
          , <code>onCommandResolved</code> and <code>onCommandRejected</code>,
          have been added.
        </li>
        <li>
          Bug Fix: Personalization interaction notification events would contain
          duplicate information about the same activity when a user navigated to
          a new single-page app view, back to the original view, and clicked an
          element qualifying for conversion.
        </li>
        <li>
          Bug Fix: If the first event sent by the SDK had{" "}
          <code>documentUnloading</code> set to <code>true</code>,{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon">
            <code>sendBeacon</code>
          </a>{" "}
          would be used to send the event, resulting in an error regarding an
          identity not being established.
        </li>
      </ul>
      <h2 id="version-2-3-0-november-2020">Version 2.3.0 - November 2020</h2>
      <ul>
        <li>
          Added nonce support to allow for stricter content security policies.
        </li>
        <li>Added personalization support for single-page applications.</li>
        <li>
          Improved compatibility with other on-page JavaScript code that may be
          overwriting <code>window.console</code> APIs.
        </li>
        <li>
          Bug Fix: <code>sendBeacon</code> was not being used when{" "}
          <code>documentUnloading</code> was set to <code>true</code> or when
          link clicks were automatically tracked.
        </li>
        <li>
          Bug Fix: A link wouldn&#39;t be automatically tracked if the anchor
          element contained HTML content.
        </li>
        <li>
          Bug Fix: Certain browser errors containing a read-only{" "}
          <code>message</code> property were not handled appropriately,
          resulting in a different error being exposed to the customer.
        </li>
        <li>
          Bug Fix: Running the SDK within an iframe would result in an error if
          the iframe&#39;s HTML page was from a different subdomain than the
          parent window&#39;s HTML page.
        </li>
      </ul>
      <h2 id="version-2-2-0-october-2020">Version 2.2.0 - October 2020</h2>
      <ul>
        <li>
          Bug Fix: The Opt-in object was blocking Alloy from making calls when{" "}
          <code>idMigrationEnabled</code> is <code>true</code>.
        </li>
        <li>
          Bug Fix: Make Alloy aware of requests that should return
          personalization offers to prevent a flickering issue.
        </li>
      </ul>
      <h2 id="version-2-1-0-august-2020">Version 2.1.0 - August 2020</h2>
      <ul>
        <li>
          Remove the <code>syncIdentity</code> command and support passing those
          IDs in the <code>sendEvent</code> command.
        </li>
        <li>Support IAB 2.0 Consent Standard.</li>
        <li>
          Support passing additional IDs in the <code>setConsent</code> command.
        </li>
        <li>
          Support overriding the <code>datasetId</code> in the{" "}
          <code>sendEvent</code> command.
        </li>
        <li>
          Support Alloy Monitors (
          <a href="https://github.com/adobe/alloy/wiki/Monitoring-Hooks">
            Read more
          </a>
          )
        </li>
        <li>
          Pass <code>environment: browser</code> in the implementation details
          context data.
        </li>
      </ul>
    </>
  );
};

export default Changelog;
