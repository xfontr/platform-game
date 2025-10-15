import { disableAsserts, enableAsserts } from "../../utils/test";
import App from "./App";
import AppGameError from "./AppGameError";

vi.resetModules();

describe("App", () => {
  test("should not allow multiple instances", () => {
    enableAsserts();

    const container = document.createElement("div");
    new App(container);

    expect(() => new App(container)).toThrow(
      new AppGameError("multiple-instances")
    );
  });

  test("should throw error if container is not found", () => {
    disableAsserts();
    expect(() => new App(null)).toThrow(new AppGameError("not-found"));
  });

  test("should throw error if app is accessed before instantiation", () => {
    disableAsserts();

    const container = document.createElement("div");
    const app = new App(container);

    expect(() => {
      enableAsserts();
      app.get();
    }).toThrow(new AppGameError("not-initialized"));
  });
});
