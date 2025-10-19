import { reactive } from "./entity.utils";

describe("reactive", () => {
  it("should call callback when property changes", () => {
    const obj = { name: "test", city: "test city" };
    const callback = vi.fn();

    const proxy = reactive(obj, callback);

    proxy.name = "new-test";

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("name", "new-test", "test");
    expect(proxy.name).toBe("new-test");
  });

  it("should not call callback if value is unchanged", () => {
    const obj = { power: 9000 };
    const callback = vi.fn();

    const proxy = reactive(obj, callback);
    proxy.power = 9000;

    expect(callback).not.toHaveBeenCalled();
  });

  it("should update the target object", () => {
    const obj = { active: false };
    const callback = vi.fn();

    const proxy = reactive(obj, callback);
    proxy.active = true;

    expect(obj.active).toBe(true);
  });

  it("should work with multiple props", () => {
    const obj = { x: 1, y: 2 };
    const callback = vi.fn();

    const proxy = reactive(obj, callback);
    proxy.x = 10;
    proxy.y = 20;

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "x", 10, 1);
    expect(callback).toHaveBeenNthCalledWith(2, "y", 20, 2);
  });
});
