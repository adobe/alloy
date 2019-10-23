import React from "react";

export default function OrgTwo() {
  return (
    <div>
      <h2>Multiple Organizations</h2>
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
                    propertyId: 8888888,
                    log: true
                });
            `}
        </code>
      </pre>
      <p>
        By going to the Network tab in your Developer Tools, you should see
        requests ending with <i>?propertyId=8888888</i>
      </p>
    </div>
  );
}
