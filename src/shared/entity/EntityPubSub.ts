import type { Watcher } from "./entity.types";

class EntityPubSub {
  private subs = new Set<Watcher>();

  protected publish(key: string, newValue: unknown, oldValue: unknown) {
    this.subs.forEach((subscriber) => {
      subscriber(key, newValue, oldValue);
    });
  }

  public subscribe(callback: Watcher) {
    this.subs.add(callback);
  }

  public unSubscribe(callback: Watcher) {
    this.subs.delete(callback);
  }
}

export default EntityPubSub;
