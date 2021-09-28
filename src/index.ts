/*
# @mizchi/testio

Deadly simple test runner with console stub.  (535byte with terser)

Support node and deno.

## How to use

Put this code and use it.

```ts
// use your own assert
import assert from "assert";
// node: 
import { _stub, _hydrate, _restore } from "./testio";
// deno:
// import { _stub, _hydrate, _restore } from "./testio.ts";

test("test1", () => {
  console.log("do not show this message on success");
  assert.equal(1, 1);
});

test("test2", () => {
  assert.equal(1, 2);
});
cancel(); // cancel last test: test2
// cancelAll(); // cancel all tests

test("async fail", async () => {
  console.log("show me on fail");
  return Promise.reject(new Error("stop"));
});

// report fail case logs
run({ stub: true, stopOnFail: false }) // default option
  .then((isSuccess) => !isSuccess && process.exit(1));
  .catch(console.error);
```

And run with ts runner.

```bash
$ npx ts-node -T -O '{"module":"commonjs"}' test.ts
$ npx esbuild-node test.ts
$ deno run test.ts
```

Result

```
=== PASS(test1)
=== FAIL(async fail)
  Error: stop
    at /Users/mizchi/zatsu/testio.ts:273:25
    at run (/Users/mizchi/zatsu/testio.ts:208:13)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
(async fail) show me on fail
```

## LICENSE

MIT
*/

type TestCase = [name: string, fn: () => void | Promise<void>];
// private state
const _tests: Array<TestCase> = [];
const _orig: any = { ...console };
const _logs: Array<[type: string, ...args: any]> = [];
const _stub = (name: string) =>
  Object.keys(_orig).forEach(
    (key) =>
      ((globalThis.console as any)[key] = (...args: any) =>
        _logs.push([key, [`(${name})`, ...args]]))
  );
const _hydrate = (show: boolean) => {
  show && _logs.forEach(([type, args]) => _orig[type](...args));
  _logs.length = 0;
};
const _restore = () => (globalThis.console = _orig);
// public api
export const cancelAll = () => (_tests.length = 0);
export const cancel = () => _tests.pop();
export const test = (...t: TestCase) => _tests.push(t);
export const run = async ({
  stub = true,
  stopOnFail = false,
}: {
  stub?: boolean;
  stopOnFail?: boolean;
}): Promise<boolean> => {
  let isSuccess = true;
  for (const [name, testFn] of _tests) {
    stub && _stub(name);
    try {
      await testFn();
      _orig.log(`=== PASS: ${name}`);
      stub && _hydrate(false);
    } catch (err) {
      _orig.error(`=== FAIL: ${name}`);
      stub && _hydrate(true);
      _orig.error(err);
      isSuccess = false;
      if (stopOnFail) break;
    }
  }
  stub && _restore();
  return isSuccess;
};
