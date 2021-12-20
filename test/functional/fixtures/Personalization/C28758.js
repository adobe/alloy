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
