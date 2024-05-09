import createSubscription from "../../../../src/utils/createSubscription.js";

describe("createSubscription", () => {
  const value = { something: 42 };

  let callback1;
  let callback2;
  let callback3;

  beforeEach(() => {
    callback1 = jasmine.createSpy("callback1");
    callback2 = jasmine.createSpy("callback2");
    callback3 = jasmine.createSpy("callback3");
  });

  it("supports a single subscription", () => {
    const subscription = createSubscription();
    expect(subscription.hasSubscriptions()).toBeFalse();

    const unsubscribe = subscription.add(callback1);

    expect(subscription.hasSubscriptions()).toBeTrue();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledOnceWith(value);

    unsubscribe();

    expect(subscription.hasSubscriptions()).toBeFalse();
    subscription.emit(value);

    expect(callback1).toHaveBeenCalledOnceWith(value);
  });

  it("supports multiple subscriptions", () => {
    const subscription = createSubscription();
    expect(subscription.hasSubscriptions()).toBeFalse();

    const unsubsubscribe1 = subscription.add(callback1);
    const unsubsubscribe2 = subscription.add(callback2);
    const unsubsubscribe3 = subscription.add(callback3);

    expect(subscription.hasSubscriptions()).toBeTrue();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledOnceWith(value);
    expect(callback2).toHaveBeenCalledOnceWith(value);
    expect(callback3).toHaveBeenCalledOnceWith(value);

    // unsubscribe the first callback
    unsubsubscribe1();

    expect(subscription.hasSubscriptions()).toBeTrue();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);

    // unsubscribe the second callback
    unsubsubscribe2();

    expect(subscription.hasSubscriptions()).toBeTrue();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(3);

    // unsubscribe the third callback
    unsubsubscribe3();

    expect(subscription.hasSubscriptions()).toBeFalse();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(3);
  });

  it("emits distinct values for multiple subscriptions", () => {
    const subscription = createSubscription();
    subscription.setEmissionPreprocessor((params, basePrice) => {
      const { name, profitMargin } = params;
      const price = basePrice * profitMargin;
      return [`hello ${name}! The price is $${price}`];
    });

    const unsubsubscribe1 = subscription.add(callback1, {
      name: "jim",
      profitMargin: 3,
    });
    const unsubsubscribe2 = subscription.add(callback2, {
      name: "bob",
      profitMargin: 1.8,
    });
    const unsubsubscribe3 = subscription.add(callback3, {
      name: "tina",
      profitMargin: 1.1,
    });

    subscription.emit(10);

    expect(callback1).toHaveBeenCalledOnceWith("hello jim! The price is $30");
    expect(callback2).toHaveBeenCalledOnceWith("hello bob! The price is $18");
    expect(callback3).toHaveBeenCalledOnceWith("hello tina! The price is $11");

    unsubsubscribe1();
    unsubsubscribe2();
    unsubsubscribe3();
  });

  it("emits distinct values conditionally", () => {
    const subscription = createSubscription();
    subscription.setEmissionPreprocessor((params, basePrice) => {
      const { name, profitMargin } = params;
      const price = basePrice * profitMargin;
      return [`hello ${name}! The price is $${price}`];
    });
    subscription.setEmissionCondition((params, result) => {
      const price = parseInt(
        result.substring(result.length - 2, result.length),
        10,
      );
      return price < 20;
    });

    const unsubsubscribe1 = subscription.add(callback1, {
      name: "jim",
      profitMargin: 3,
    });
    const unsubsubscribe2 = subscription.add(callback2, {
      name: "bob",
      profitMargin: 1.8,
    });
    const unsubsubscribe3 = subscription.add(callback3, {
      name: "tina",
      profitMargin: 1.1,
    });

    subscription.emit(10);

    expect(callback1).not.toHaveBeenCalled(); // price is > 20, so no emission
    expect(callback2).toHaveBeenCalledOnceWith("hello bob! The price is $18");
    expect(callback3).toHaveBeenCalledOnceWith("hello tina! The price is $11");

    unsubsubscribe1();
    unsubsubscribe2();
    unsubsubscribe3();
  });
});
