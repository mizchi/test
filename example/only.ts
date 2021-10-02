export { add } from "./add";
export { sub } from "./sub";

/* === test start === */
import { run, test, cancelAll } from "@mizchi/test";
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
  isMain && cancelAll();
  test("ok", () => {});
  run({ isMain });
}
