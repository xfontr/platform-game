import EntityPubSub from "./EntityPubSub";

class EntityPubSubTest extends EntityPubSub {
  testPublish(key: string, newValue: unknown, oldValue: unknown) {
    this.publish(key, newValue, oldValue);
  }
}

describe("EntityPubSub", () => {
  const key = "key";
  const oldValue = 0;
  const newValue = 1;
  const subscribers = +(Math.random() * 100).toFixed(0);
  const publishCalls = +(Math.random() * 100).toFixed(0);

  it("publishes old and new values to the subscriber", () => {
    const watcher = vi.fn();

    const pubSub = new EntityPubSubTest();

    pubSub.subscribe(watcher);

    pubSub.testPublish(key, oldValue, newValue);

    expect(watcher).toHaveBeenCalledExactlyOnceWith(key, oldValue, newValue);
  });

  it(`accepts publishing ${publishCalls} times to the same subscriber`, () => {
    const watcher = vi.fn();

    const pubSub = new EntityPubSubTest();

    pubSub.subscribe(watcher);

    new Array(publishCalls).fill(undefined).forEach(() => {
      pubSub.testPublish(key, oldValue, newValue);
    });

    expect(watcher).toHaveBeenCalledTimes(publishCalls);
  });

  it(`handles '${subscribers}' subscribers`, () => {
    const watchers = new Array(subscribers).fill(undefined).map(vi.fn);

    const pubSub = new EntityPubSubTest();

    watchers.forEach((watcher) => {
      pubSub.subscribe(watcher);
    });

    pubSub.testPublish(key, oldValue, newValue);

    watchers.forEach((watcher) => {
      expect(watcher).toHaveBeenCalledOnce();
    });
  });

  it("deletes the desired subscriber", () => {
    const watcher = vi.fn();

    const pubSub = new EntityPubSubTest();

    pubSub.subscribe(watcher);
    pubSub.unSubscribe(watcher);

    pubSub.testPublish(key, oldValue, newValue);

    expect(watcher).not.toHaveBeenCalled();
  });
});
