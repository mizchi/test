export { add } from "./add";
export { sub } from "./sub";

/* === test start === */
import { run, test, cancelAll } from "../src/index";
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
  // cancelAll();
  test("ok", () => {});
  run({ isMain });
}
