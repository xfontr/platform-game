import type { Watcher } from "./entity.types";

export function reactive<T extends object>(instance: T, callback: Watcher<T>) {
  return new Proxy(instance, {
    set: (target, p, newValue) => {
      const currentValue = instance[p as keyof T];
      if (currentValue === newValue) return true;

      callback(p as keyof T, newValue, currentValue);

      target[p as keyof T] = newValue;

      return true;
    },
  });
}
