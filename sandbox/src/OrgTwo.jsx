import React, { useEffect } from "react";
import sendPageViewEvent from "./helpers/sendPageViewEvent";
import setupAlloy from "./helpers/setupAlloy";
import configureAlloy from "./helpers/configureAlloy";

export default function OrgTwo() {
  useEffect(() => {
    setupAlloy({ instanceNames: ["alloy", "organizationTwo"] });

    configureAlloy();
    configureAlloy({
      instanceName: "organizationTwo",

      datastreamId: "7984963a-6609-4e84-98d5-4e2ff8c0dd5e:prod",
      orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
      clickCollectionEnabled: false,
    });

    sendPageViewEvent({ instanceName: "organizationTwo" });
  }, []);
  return (
    <div>
      <h1>Multiple Organizations</h1>
      <p>
        This view is managed by a partnering company that owns a different Org
        ID.
      </p>
      <p>
        For that reason, we have created a second instance of Alloy, and
        configured it using the Org and Property IDs of Organization Two.
      </p>
      <p>
        Alloy instance is called: <i>organizationTwo</i>
      </p>
      <pre>
        <code>
          {`
                organizationTwo("configure", {
                  datastreamId: 8888888,
                });
            `}
        </code>
      </pre>
      <p>
        By going to the Network tab in your Developer Tools, you should see
        requests ending with <i>?configId=8888888</i>
      </p>
    </div>
  );
}
