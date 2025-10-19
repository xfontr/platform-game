import {
  disableAsserts,
  enableAsserts,
  simulateProduction,
} from "../../utils/test";
import Component from "./Component";
import ECSError from "./ECSError";
import Entity from "./Entity";

class MockComponent extends Component {
  x = 4;
}

beforeAll(enableAsserts);
afterAll(disableAsserts);

describe("Entity", () => {
  it("should add the requested component", () => {
    const component = new MockComponent();

    const entity = new Entity().add(component);

    expect(entity.has(component)).toBeTruthy();
    expect(entity.isDirty).toBeTruthy();
  });

  it("should not allow adding already added components", () => {
    const expectedError = new ECSError("component.add.added");

    const firstComponent = new MockComponent();
    const secondComponent = new MockComponent();

    const entity = new Entity().add(firstComponent);

    expect(() => entity.add(secondComponent)).toThrowError(expectedError);
  });

  it("should allow adding already added components if production", () => {
    const firstComponent = new MockComponent();
    const secondComponent = new MockComponent();

    const entity = new Entity().add(firstComponent);

    simulateProduction(() => {
      expect(() => entity.add(secondComponent)).not.toThrowError();
    });
  });

  it("should get the requested component", () => {
    const component = new MockComponent();

    const entity = new Entity().add(component);

    const found = entity.get(component);

    expect(found).toStrictEqual(component);
  });

  it("should throw error if the requested component is not found", () => {
    const expectedError = new ECSError("component.get.not.found");
    const component = new MockComponent();

    const entity = new Entity();

    expect(() => entity.get(component)).toThrowError(expectedError);
  });

  it("should not throw error if the requested component is not found in production", () => {
    const component = new MockComponent();

    const entity = new Entity();

    simulateProduction(() => {
      expect(() => entity.get(component)).not.toThrowError();
    });
  });

  it("should delete the requested component", () => {
    const component = new MockComponent();

    const entity = new Entity();

    entity.add(component);
    entity.delete(component);

    expect(entity.has(component)).toBeFalsy();
    expect(entity.isDirty).toBeTruthy();
  });

  it("should throw error if does not find requested component to delete", () => {
    const expectedError = new ECSError("component.delete.not.found");
    const component = new MockComponent();

    const entity = new Entity();

    expect(() => entity.delete(component)).toThrowError(expectedError);
    expect(entity.isDirty).toBeFalsy();
  });

  it("should not throw error if does not find requested component to delete in production", () => {
    const expectedError = new ECSError("component.delete.not.found");
    const component = new MockComponent();

    const entity = new Entity();

    simulateProduction(() => {
      expect(() => entity.delete(component)).not.toThrowError(expectedError);
    });

    expect(entity.isDirty).toBeFalsy();
  });
});
