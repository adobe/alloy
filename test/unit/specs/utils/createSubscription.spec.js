/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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

    const { unsubscribe } = subscription.add(callback1);

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

    const { unsubscribe: unsubscribe1 } = subscription.add(callback1);
    const { unsubscribe: unsubscribe2 } = subscription.add(callback2);
    const { unsubscribe: unsubscribe3 } = subscription.add(callback3);

    expect(subscription.hasSubscriptions()).toBeTrue();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledOnceWith(value);
    expect(callback2).toHaveBeenCalledOnceWith(value);
    expect(callback3).toHaveBeenCalledOnceWith(value);

    // unsubscribe the first callback
    unsubscribe1();

    expect(subscription.hasSubscriptions()).toBeTrue();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);

    // unsubscribe the second callback
    unsubscribe2();

    expect(subscription.hasSubscriptions()).toBeTrue();

    subscription.emit(value);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(3);

    // unsubscribe the third callback
    unsubscribe3();

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

    const { unsubscribe: unsubscribe1 } = subscription.add(callback1, {
      name: "jim",
      profitMargin: 3
    });
    const { unsubscribe: unsubscribe2 } = subscription.add(callback2, {
      name: "bob",
      profitMargin: 1.8
    });
    const { unsubscribe: unsubscribe3 } = subscription.add(callback3, {
      name: "tina",
      profitMargin: 1.1
    });

    subscription.emit(10);

    expect(callback1).toHaveBeenCalledOnceWith("hello jim! The price is $30");
    expect(callback2).toHaveBeenCalledOnceWith("hello bob! The price is $18");
    expect(callback3).toHaveBeenCalledOnceWith("hello tina! The price is $11");

    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
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
        10
      );
      return price < 20;
    });

    const { unsubscribe: unsubscribe1 } = subscription.add(callback1, {
      name: "jim",
      profitMargin: 3
    });
    const { unsubscribe: unsubscribe2 } = subscription.add(callback2, {
      name: "bob",
      profitMargin: 1.8
    });
    const { unsubscribe: unsubscribe3 } = subscription.add(callback3, {
      name: "tina",
      profitMargin: 1.1
    });

    subscription.emit(10);

    expect(callback1).not.toHaveBeenCalled(); // price is > 20, so no emission
    expect(callback2).toHaveBeenCalledOnceWith("hello bob! The price is $18");
    expect(callback3).toHaveBeenCalledOnceWith("hello tina! The price is $11");

    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
  });
});
