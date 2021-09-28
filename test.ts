import assert from "assert";
// node:
// import { _stub, _hydrate, _restore } from "./src/index";
// deno:
import { test, run, cancel } from "./src";

test("test1", () => {
  console.log("do not show this message on success");
  assert.equal(1, 1);
});

test("test2", () => {
  assert.equal(1, 2);
});
cancel(); // cancel last test: test2

test("test3", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(1, 1);
});

// cancelAll(); // cancel all tests

// test("async fail", async () => {
//   console.log("show me on fail");
//   return Promise.reject(new Error("stop"));
// });

// report fail case logs
run({ stub: true, stopOnFail: false }) // default option
  .then((isSuccess) => !isSuccess && process.exit(1))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
