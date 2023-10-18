import createSubscription from "../../../../src/utils/createSubscription";

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
});
