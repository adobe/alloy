import React from "react";

function loadLaunch () {
    const script = document.createElement("script");

    script.src = "http://assets.adobedtm.com/launch-ENaa9d45a2136f487791ebc8420ec24dbe.min.js";
    script.async = true;

    document.body.appendChild(script);
}

export default function DualTag() {
    return (
        <div>
        {loadLaunch()}
        <h2>Dual Tagging</h2>
        <h3>This page loads a launch library containing Analytics, ECID, DIL, and Target.</h3>
        <p>This is for testing interactions between alloy and the legacy libraries. In particular we are looking for conflicts in personalization, ecid, and id/dest syncs.</p>
        </div>
    );
}
