import { sleep, retry } from "../src/utils";

describe("sleep function", () => {
  test("resolved after 300ms", () => {
    const start = Date.now();
    return sleep(300).then(() => {
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(300);
      expect(end - start).toBeLessThan(400);
    });
  });
});

describe("retry function", () => {
  test("default parameter", () => {
    const alwaysReject = jest.fn(() => Promise.reject("Error"));
    const start = Date.now();
    return retry(alwaysReject).then(
      () => {},
      () => {
        const end = Date.now();
        expect(alwaysReject.mock.calls).toHaveLength(4);
        expect(end - start).toBeGreaterThanOrEqual(900);
        expect(end - start).toBeLessThan(1000);
      }
    );
  });

  test("retry 5 times", () => {
    const alwaysReject = jest.fn(() => Promise.reject("Error"));
    const start = Date.now();
    return retry(alwaysReject, 5).then(
      () => {},
      () => {
        const end = Date.now();
        expect(alwaysReject.mock.calls).toHaveLength(6);
        expect(end - start).toBeGreaterThanOrEqual(1500);
        expect(end - start).toBeLessThan(1600);
      }
    );
  });

  test("retry delay 500ms", () => {
    const alwaysReject = jest.fn(() => Promise.reject("Error"));
    const start = Date.now();
    return retry(alwaysReject, 3, 500).then(
      () => {},
      () => {
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(1500);
        expect(end - start).toBeLessThan(1600);
      }
    );
  });
});
