import {
  sleep,
  retry,
  isEmpty,
  dateTimeFormat,
  generateRandomId,
} from "../src/utils";

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

describe("isEmpty function", () => {
  test("all empty values", () => {
    expect(isEmpty("")).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(NaN)).toBe(true);
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Set())).toBe(true);
  });
  test("none empty values", () => {
    expect(isEmpty(0)).toBe(false);
    expect(isEmpty(true)).toBe(false);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty(new Map().set("a", 1))).toBe(false);
    expect(isEmpty(new Set().add(1))).toBe(false);
    expect(isEmpty(new WeakMap())).toBe(false);
    expect(isEmpty(new WeakSet())).toBe(false);
  });
});

describe("dateTimeFormat function", () => {
  test("correct formatting", () => {
    const date = new Date("2024-01-01 12:00:00.000");
    let formated;
    formated = dateTimeFormat(date, "YYYY-MM-DD HH:mm:ss.sss");
    expect(formated).toBe("2024-01-01 12:00:00.000");
    formated = dateTimeFormat(date, "YYYY年MM月DD日 HH时mm分ss秒sss");
    expect(formated).toBe("2024年01月01日 12时00分00秒000");
  });
});

describe("generateRandomId function", () => {
  test("correct formatting", () => {
    let id;
    id = generateRandomId();
    expect(id).toHaveLength(32);
    id = generateRandomId(16);
    expect(id).toHaveLength(16);
  });
});
