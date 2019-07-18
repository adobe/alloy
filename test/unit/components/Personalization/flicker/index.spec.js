import { selectNodes, removeNode } from "../../../../../src/utils/dom";
import {
  hideElements,
  showElements
} from "../../../../../src/components/Personalization/flicker";

describe("Personalization::flicker", () => {
  beforeEach(() => {
    selectNodes("style").forEach(removeNode);
  });

  afterEach(() => {
    selectNodes("style").forEach(removeNode);
  });

  it("should add prehiding style tags", () => {
    const prehidingSelector = ".add";

    hideElements(prehidingSelector);

    const styles = selectNodes("style");

    expect(styles.length).toEqual(1);

    const styleDefinition = styles[0].textContent;

    expect(styleDefinition).toEqual(
      `${prehidingSelector} { visibility: hidden }`
    );
  });

  it("should remove prehiding style tags", () => {
    const prehidingSelector = ".remove";

    hideElements(prehidingSelector);
    showElements(prehidingSelector);

    const styles = selectNodes("style");

    expect(styles.length).toEqual(0);
  });
});
