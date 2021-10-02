# @mizchi/testio

Deadly simple test runner with console stub.  (535byte with terser)

Support node and deno.

## How to use

```ts
// use your own assert
// import assert from "assert";
import { test, run, cancel, cancelAll, is, err } from "@mizchi/testio";

test("test1", () => {
  console.log("do not show this message on success");
  is(1, 1);
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
const isMain = require.main === module;
run({ isMain }) // default option
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