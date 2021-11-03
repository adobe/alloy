import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Home = () => {
  return (
    <>
      <script>
        document.addEventListener("DOMContentLoaded", function(){" "}
        {alert("Finished loading")});
      </script>
      <h1>Adobe Experience Platform Web SDK</h1>
      <p>
        Adobe Experience Platform Web SDK is a client-side JavaScript library
        that allows customers of Adobe Experience Cloud to interact with the
        various services in the [!DNL Experience Cloud] through the Adobe
        Experience Platform Edge Network. In addition to the JavaScript library,
        there is a{" "}
        <a href="../tags/extensions/web/sdk/overview.md">tag extension</a> to
        help with your Web SDK configurations.
      </p>
      <h2>Installation</h2>
      <p>You can install the module via npm by running:</p>
      <SyntaxHighlighter
        language="shell"
        style={nightOwl}
        customStyle={{ padding: "1em" }}
      >
        $ npm i @adobe/alloy
      </SyntaxHighlighter>
      <h2 id="experience-edge">Experience Edge</h2>

      <p>Adobe Experience Platform Web SDK replaces the following SDKs:</p>
      <ul>
        <li>Visitor.js</li>
        <li>AppMeasurement.js</li>
        <li>AT.js</li>
        <li>DIL.js</li>
      </ul>
      <p>
        This is not just a wrapper around existing libraries. It is a complete
        rewrite. Its purpose is to end challenges with tags having to fire in
        the right order, inconsistency with library versioning challenges, and
        better dependency management. It is a new way to implement the [!DNL
        Experience Cloud] and it is{" "}
        <a href="https://github.com/adobe/alloy">open source</a>.
      </p>
      <p>
        In addition to a new library, there is a new endpoint that streamlines
        the HTTP requests to Adobe solutions. Before, Visitor.js sent a blocking
        call to the visitor ID service, then AT.js sent a call to Adobe Target,
        DIL.js sent a call to Adobe Audience Manager, and finally
        AppMeasurement.js sent a call to Adobe Analytics. This new library and
        endpoint can retrieve an ID, fetch a [!DNL Target] experience, send data
        to [!DNL Audience Manager], and pass the data to Adobe Experience
        Platform in a single call.
      </p>
      <ul>
        <li>
          <strong>Use Cases Not Yet Supported:</strong> These are use cases that
          are on our roadmap to be supported in the future.
        </li>
        <li>
          <strong>Use Cases In Progress:</strong> These are the use cases the
          team is currently working on completing for release.
        </li>
        <li>
          <strong>Supported Use Cases:</strong> These are the use cases that are
          supported and work today.{" "}
        </li>
        <li>
          <strong>Use Cases We Won&#39;t Support:</strong> These are the use
          cases we have made a decision not to support.
        </li>
      </ul>

      <h2>Usage Notes</h2>
      <p>
        This file is licensed to you under the Apache License, Version 2.0 (the
        "License"); you may not use this file except in compliance with the
        License. You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable
        law or agreed to in writing, software distributed under the License is
        distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
        OF ANY KIND, either express or implied. See the License for the specific
        language governing permissions and limitations under the License.
      </p>
      <p>
        You can view the source code for this project on{" "}
        <a
          href="https://github.com/adobe/alloy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
        . At the very least it will give you an idea of how you can use this
        module.
      </p>

      <h2>Licence</h2>
      <p>
        This module is available under the{" "}
        <a href="http://opensource.org/licenses/MIT">MIT Licence</a>
      </p>

      <h2>Bugs &amp; Issues</h2>
      <p>
        Please report any issues via the{" "}
        <a
          href="https://github.com/adobe/alloy/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub issues page
        </a>
        .
      </p>
    </>
  );
};

export default Home;
