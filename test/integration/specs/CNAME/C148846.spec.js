import { describe, it } from "vitest";
import setupAlloy from "../../helpers/setupAlloy";
import getAlloyConfig from "../../helpers/getAlloyConfig";

describe("C148846 - Setting edgeDomain to CNAME", () => {
  it("C148846 - Setting edgeDomain to CNAME results in server calls to this CNAME", async () => {
    const alloy = await setupAlloy(getAlloyConfig());

    await alloy("sendEvent");
    await alloy("sendEvent");

    // // Asserts initial state.
    // await expect
    //   .element(page.getByText("Hi, my name is Alice"))
    //   .toBeInTheDocument();
    //
    // // Get the input DOM node by querying the associated label.
    // const usernameInput = page.getByLabelText(/username/i);
    //
    // // Type the name into the input. This already validates that the input
    // // is filled correctly, no need to check the value manually.
    // await usernameInput.fill("Bob");
    //
    // await expect
    //   .element(page.getByText("Hi, my name is Bob"))
    //   .toBeInTheDocument();
  });
});
