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
export const shadowDomScript = `
    const buyNowContent = \`
    <div>
      <input type="radio" id="buy" name="buy_btn" value="Buy NOW">
      <label for="buy">Buy Now</label><br>
      <div>
        <input type="radio" id="buy_later" name="buy_btn_ltr" value="Buy LATER">
        <label for="buy_later">Buy Later</label><br>
      </div>
    </div>
  \`;
    customElements.define(
      "buy-now-button",
      class extends HTMLElement {
        constructor() {
          super();

          const shadowRoot = this.attachShadow({ mode: "open" });
          shadowRoot.innerHTML = buyNowContent;
        }
      }
    );

    const productOrderContent = \`<div><p>Product order</p><buy-now-button>Buy</buy-now-button></div>\`;
    customElements.define(
      "product-order",
      class extends HTMLElement {
        constructor() {
          super();

          const shadowRoot = this.attachShadow({ mode: "open" });
          shadowRoot.innerHTML = productOrderContent;
        }
      }
    );
`;

export const shadowDomFixture = `
  <form id="form" action="https://www.adobe.com" method="post">
    <buy-now-button>FirstButton</buy-now-button>
    <buy-now-button>SecondButton</buy-now-button>
    <product-order>FirstOrder</product-order>
    <product-order>SecondOrder</product-order>
    <input type="submit" value="Submit"/>
  </form>
  `;
