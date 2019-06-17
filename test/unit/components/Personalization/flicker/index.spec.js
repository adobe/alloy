import { selectNodes, removeNode } from "../../../../../src/utils/dom";
import {
  hideElements,
  showElements
} from "../../../../../src/components/Personalization/flicker";

describe("Presonalization::flicker", () => {
  beforeEach(() => {
    selectNodes("style").forEach(removeNode);
  });

  afterEach(() => {
    selectNodes("style").forEach(removeNode);
  });

  it("should add prehiding style tags", () => {
    const prehidingSelector = ".container";

    hideElements(prehidingSelector);

    const styles = selectNodes("style");

    expect(styles.length).toEqual(1);

    const styleDefinition = styles[0].innerText;

    expect(styleDefinition).toEqual(
      `${prehidingSelector} { visibility: hidden }`
    );
  });

  it("should remove prehiding style tags", () => {
    const prehidingSelector = ".container";

    hideElements(prehidingSelector);
    showElements(prehidingSelector);

    const styles = selectNodes("style");

    expect(styles.length).toEqual(0);
  });
});
