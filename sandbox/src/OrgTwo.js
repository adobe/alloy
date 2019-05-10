import React from "react";

export default function OrgTwo() {
    return (
        <div>
        <h2>Organization Two</h2>
        <h3>This view is managed by a partnering company that owns a different Org ID.</h3>
        <p>For that reason, we have created a second instance of Alloy, and configurered it using the Org and Property IDs of Organization Two.</p>
        <p>Alloy instance is called: <i>organizationTwo</i></p>
        <pre>
            <code>
            {`
                organizationTwo("configure", {
                    propertyID: 8888888,
                    destinationsEnabled: true,
                    debug: true
                });
            `}
            </code>
        </pre>
        <p>By going to the Network tab in your Developer Tools, you should see requests ending with <i>?propertyID=8888888</i></p>
        </div>
    );
}
