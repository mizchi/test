import { sub } from "./sub";

export function add(a: number, b: number) {
  return a + b;
}

/*
  test code in same file
  define constants for builder for DCE
  {
    "process.env.NODE_ENV": JSON.stringify("test"),
    "require.main === module": JSON.stringify(false), // for prettier format
  }
*/

import { test, run, is, err } from "@mizchi/test";
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
  test("add", () => {
    console.log("do not show this message on success");
    is(add(1, 1), 2);
    err(() => is(add(1, -1), 3));
  });
  run({ isMain });
}
