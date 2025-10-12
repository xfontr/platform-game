type Watcher = (key: string, newValue: unknown, oldValue: unknown) => void;

class EntityPubSub {
  private subs = new Set<Watcher>();

  public publish(key: string, newValue: unknown, oldValue: unknown) {
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
