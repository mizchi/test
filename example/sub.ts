export function sub(a: number, b: number) {
  return a - b;
}

import { test, run, is } from "../src/index";
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
  test("sub", () => {
    is(sub(1, 2), -1);
  });
  run({ isMain });
}
