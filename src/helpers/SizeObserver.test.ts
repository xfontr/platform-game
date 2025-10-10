import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SizeObserver from "./SizeObserver";

// WARNING: Vibe-coded slop, human review pending.

const element = document.createElement("div");
element.getBoundingClientRect = vi.fn(() => ({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  x: 0,
  y: 0,
  toJSON: () => ({}),
}));

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let mockResizeObserver: any;

beforeEach(() => {
  mockResizeObserver = vi.fn((callback) => {
    mockResizeObserver.callback = callback;
    return { observe: mockObserve, disconnect: mockDisconnect };
  });

  global.ResizeObserver = mockResizeObserver;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SizeObserver", () => {
  it("calls the resize callback when element is resized", () => {
    const observer = new SizeObserver(element);
    const callback = vi.fn();

    observer.onResize(callback);

    const fakeEntry = { contentRect: { width: 200, height: 200 } };
    mockResizeObserver.callback([fakeEntry]);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(fakeEntry.contentRect, element);
  });

  it("does not start observing until the first callback is added", () => {
    new SizeObserver(element);
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it("starts observing when the first callback is added", () => {
    const observer = new SizeObserver(element);
    observer.onResize(vi.fn());
    expect(mockObserve).toHaveBeenCalledWith(element);
  });

  it("does not re-observe when multiple callbacks are added", () => {
    const observer = new SizeObserver(element);
    observer.onResize(vi.fn());
    observer.onResize(vi.fn());
    expect(mockObserve).toHaveBeenCalledTimes(1);
  });

  it("disconnects observer on destroy", () => {
    const observer = new SizeObserver(element);
    observer.onResize(vi.fn());
    observer.onDestroy();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
