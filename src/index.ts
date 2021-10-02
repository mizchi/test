// any match symbol
export const ANY = Symbol();
const UNREACHABLE_MESSAGE = "throw here!";

type TestCase = [name: string, fn: () => void | Promise<void>];
let _freezed = false;
const _tests: Array<TestCase> = [];
const _orig: any = { ...console };
const _logs: Array<[type: string, ...args: any]> = [];
const _stub = (prefix: string) =>
  Object.keys(_orig).forEach(
    (key) =>
      ((globalThis.console as any)[key] = (...args: any) =>
        _logs.push([key, [`(${prefix})`, ...args]]))
  );
const _hydrate = (show: boolean) => {
  show && _logs.forEach(([type, args]) => _orig[type](...args));
  _logs.length = 0;
};

export const err = <T>(
  fn: () => T
): T extends Promise<any> ? Promise<void> : void => {
  const error = () => {
    throw new Error(UNREACHABLE_MESSAGE);
  };
  let catchError = false;
  try {
    const maybePromise = fn();
    if (maybePromise instanceof Promise)
      return maybePromise.then(error, (_: any) => {}) as any;
  } catch (err) {
    catchError = true;
  }
  if (!catchError) {
    error();
  }
  return undefined as any;
};

const format = (v: any) =>
  (JSON.stringify(v, null, 2) ?? "")
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");

export const is = (left: any, right: any, paths: string[] = []): void => {
  if (right === ANY) {
    return;
  }
  // right = ANY;
  if (left === right) return;
  const rType = typeof right;
  if (right !== null && rType === "object") {
    for (const key in right) {
      right.hasOwnProperty(key) &&
        is(left?.[key], right?.[key], [...paths, key]);
    }
    return;
  }
  throw new Error(
    `Not match(${paths.join(".") || "."})\n[left]:\n${format(
      left
    )}\n[right]:\n${format(right)}`
  );
};

const _restore = () => (globalThis.console = _orig);
// public api
export const cancelAll = () => (_tests.length = 0);
export const cancel = () => _tests.pop();
export const test = (...t: TestCase) => {
  if (_freezed) {
    console.warn("[test] Tests are frozen");
    return;
  }
  _tests.push(t);
};

const _release = () => {
  _freezed = false;
  _tests.length = 0;
};

export const run = async ({
  prefix,
  stub = true,
  stopOnFail = false,
  isMain = true,
}: {
  prefix?: string;
  stub?: boolean;
  stopOnFail?: boolean;
  isMain?: boolean;
} = {}): Promise<boolean | void> => {
  if (!isMain) return;

  _freezed = true;
  let hasError = false;
  const pre = (name: string) => (prefix ? `${prefix}@${name}` : name);
  for (const [name, testFn] of _tests) {
    stub && _stub(pre(name));
    try {
      await testFn();
      _orig.log(`=== PASS: ${pre(name)}`);
      stub && _hydrate(false);
    } catch (err) {
      _orig.error(`=== FAIL: ${pre(name)}`);
      stub && _hydrate(true);
      _orig.error(err);
      hasError = true;
      if (stopOnFail) {
        _release();
        break;
      }
    }
  }
  stub && _restore();
  _release();
  if (isMain && hasError) {
    // process.exit(1);
    throw new Error("[test] exit with error");
  }
};

/* Deno */
// const isMain = import.meta.main;
// if (isMain) {
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
  test("test1", () => {
    console.log("do not show this message on success");
    is(1, 1);
  });

  test("test-will-cancel", () => {
    is(1, 2);
  });
  cancel();

  test("test3", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    is(1, 1);
  });

  test("throws", () => {
    err(() => {
      throw "pass me";
    });
    try {
      err(() => {});
      throw new Error("DO NOT PASS");
    } catch (err) {
      if ((err as Error).message !== "throw here!") {
        throw new Error("throws does not throw");
      }
    }
  });

  test("throws:async", async () => {
    await err(async () => {
      throw new Error("pass me");
    });
    try {
      await err(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      throw new Error("DO NOT PASS");
    } catch (err) {
      if ((err as Error).message !== "throw here!") {
        throw new Error("async throws does not throw");
      }
    }
  });
  test("match", () => {
    is(false, ANY);
    is(1, 1);
    is({ a: 1 }, { a: 1 });
    err(() => is(1, 0));
    is(undefined, undefined);
    is({ a: 1, b: 2 }, { a: 1 });
    is({ a: 1, b: 2 }, {});
    err(() => is({ a: 1 }, { a: 2 }));
    is([1], []);
    is([1], [1]);
    is([1, 2, 0], [1, ANY, ANY]);
    is([1, 2, 0], [1, ANY, ANY, ANY]);
    err(() => is([], [1]));
    err(() => is(null, [1, 2]));
    err(() => is([1, 2, 1], [1, 3]));
    err(() => is({ a: { b: 1 } }, { a: { b: 2 } }));
  });
  run({ prefix: "self", isMain, stub: true, stopOnFail: false });
}
