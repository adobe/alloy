/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export const testPageHead = `
<style>
  body {
    padding-top: 50px;
  }

  img.target-offer {
    margin-bottom: 20px;
  }

  #some-buttons {
    margin: 20px 0;
  }
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.6.0.slim.min.js" integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
`;

export const testPageBody = `
<nav class="navbar navbar-inverse navbar-fixed-top">
  <div class="container">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">Web Site</a>
    </div>
    <div id="navbar" class="collapse navbar-collapse">
      <ul class="nav navbar-nav">
        <li class="active"><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div><!--/.nav-collapse -->
  </div>
</nav>
<div class="container">
  <div class="page-header">
    <h1>Hello World!</h1>
  </div>
  <img id="target-offer" src="img/demo-marketing-offer1-default.png" width="640" alt="target offer" class="img-responsive img-rounded target-offer" />
  <p id="paragraph-text-1" class="lead">
    This is a sample web page. It leverages the <a
    href="https://experienceleague.adobe.com/docs/experience-platform/edge/home.html">Adobe Experience Platform Web
    SDK</a> and <a
    href="https://experienceleague.adobe.com/docs/experience-platform/edge-network-server-api/overview.html">APIs</a>
    to render personalization content.
  </p>
  <p id="paragraph-text-2">
    Vestibulum cursus tristique risus, volutpat lobortis quam fermentum dapibus. Sed lacus augue, vulputate a placerat
    vel, fringilla sed velit. In aliquet odio ut efficitur gravida. Vivamus volutpat hendrerit nisl ut rutrum. Donec
    id nunc dolor. Pellentesque lectus mi, consequat sit amet elit vitae, laoreet euismod est. Cras placerat ex
    ligula, nec malesuada dolor feugiat ut. Ut condimentum ante turpis, a iaculis massa cursus vitae. Sed sed felis
    quam. Sed hendrerit, nisl vel viverra viverra, nisi mauris laoreet tortor, ut blandit lectus lacus ut tellus.
    Integer ante sapien, tincidunt ut erat id, volutpat finibus urna. Aliquam rhoncus tellus vitae facilisis varius.
  </p>

  <div id="some-buttons">
    <button id="action-button-1" data-id="1" type="button" class="btn btn-primary">One</button>
    <button id="action-button-2" data-id="2" type="button" class="btn btn-success">Two</button>
    <button id="action-button-3" data-id="3" type="button" class="btn btn-info">Three</button>
  </div>
</div>
`;
