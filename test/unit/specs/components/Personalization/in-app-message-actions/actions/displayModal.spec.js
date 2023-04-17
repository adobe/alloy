import { createNode } from "../../../../../../../src/utils/dom";
import { DIV } from "../../../../../../../src/constants/tagName";
import displayModal from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayModal";

describe("Personalization::IAM:modal", () => {
  it("inserts banner into dom", async () => {
    const something = createNode(
      DIV,
      { className: "something" },
      {
        innerHTML:
          "<p>Amet cillum consectetur elit cupidatat voluptate nisi duis et occaecat enim pariatur.</p>"
      }
    );

    document.body.append(something);

    await displayModal({
      type: "modal",
      horizontalAlign: "center",
      verticalAlign: "center",
      closeButton: true,
      dimBackground: true,
      content:
        "<p>Special offer, don't delay!</p><img src='https://media3.giphy.com/media/3rXv6MUPvkX2jLgeUL/200.gif'>",
      buttons: [
        {
          title: "Yes please!"
        },
        {
          title: "No, thanks"
        }
      ]
    });

    const modal = document.querySelector("div#alloy-messaging-modal");
    const modalStyle = document.querySelector(
      "style#alloy-messaging-modal-styles"
    );

    expect(modal).not.toBeNull();
    expect(modalStyle).not.toBeNull();

    expect(modal.parentNode).toEqual(document.body);
    expect(modalStyle.parentNode).toEqual(document.head);

    expect(modal.previousElementSibling).toEqual(something);
    expect(modal.nextElementSibling).toBeNull();

    expect(
      modal.querySelector(".alloy-modal-content").innerText.trim()
    ).toEqual("Special offer, don't delay!");

    const buttons = modal.querySelector(".alloy-modal-buttons");

    expect(buttons.childElementCount).toEqual(2);
    expect(buttons.children[0].innerText).toEqual("Yes please!");
    expect(buttons.children[1].innerText).toEqual("No, thanks");
  });
});
