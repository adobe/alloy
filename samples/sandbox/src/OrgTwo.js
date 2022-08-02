import React from "react";
import useSendPageViewEvent from "./useSendPageViewEvent";

export default function OrgTwo() {
  useSendPageViewEvent({ instanceName: "organizationTwo" });
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
                  edgeConfigId: 8888888,
                    log: true
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
