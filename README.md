# @mizchi/test

Simple test runner to run test standalone with console stub.

Test is incremental. Just run tests in related scope.

Support `node` and `deno`.

## Concepts

- Lightweight and no dependency.
- Inline code testing helper. All files are executable as test runner.
- Drop test codes by terser DCE.
- Stub `console` to hydrate logs at fail only.

## How to use

```bash
yarn add @mizchi/test esbuild esbuild-register --dev
# esbuild(-register) is optional for typescript
```

(`esbuild-node` is not suitable because it removes `require.main`)

### simple

```ts
// hello.ts
export function add(a: number, b: number) {
  return a + b;
}

import { test, run, is } from "@mizchi/test";
test("test1", () => {});
run();
```

run

```bash
$ node -r esbuild-register hello.js
=== PASS: test1
```

### with many files + DCE friendly

Simple code always runs by import and bundler includes it. With many files, other logs are annoying.

Write code for dead code ellimination(DCE) and entry detecting.

```ts
export function add(a: number, b: number) {
  return a + b;
}

/* === test start === */
import { test, run, is, err } from "@mizchi/test";
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
// or main only.
// if (process.env.NODE_ENV === "test" && isMain) {
  test("test1", () => {
    console.log("do not show this message on success");
    is(add(1, 1), 2);
    err(() => is(add(1, -1), 3));
  });
  test("test2", () => {
    is(sub, 1);
  });
  run({ isMain });
}
```

Run

```bash
$ NODE_ENV=test node -r esbuild-register add.ts
=== PASS: test1
=== PASS: test2
```

See `example/*.ts`

## Drop tests in Build: Vite Example

Define `process.env.NODE_ENV=production` and `require.main === module`

vite example.

```ts
// vite.config.ts
import { defineConfig } from "vite";
export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "require.main === module": JSON.stringify(false),
  },
});
```

or [DefinePlugin | webpack](https://webpack.js.org/plugins/define-plugin/) and others.

### easy assertion tool (or use other assertion)

`is()` and `err()` are bundled.

- `is(a, b): void`:  helper match partially.
- `err(fn: () => void | Promise<void>): void`: catches `throw`. `fn` should throw.

```ts
import {is, err, ANY} from "@mizchi/test";
is(false, ANY);
is(1, 1);
is({ a: 1 }, { a: 1 });
err(() => is(1, 0));
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
```

In complex case, use your favorite assertion library.

## Snippets

### Node: run with dependency tests

```ts
/* === test start === */
import { run, test } from "@mizchi/test";
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
  test("ok", () => {
    // write here
  });
  run({ isMain });
}
```

I reccomend this and run all tests by eg. `src/index.ts`.

### Node: run as main only

with `cancelAll()` before run.

```ts
/* === test start === */
import { run, test, cancelAll } from "@mizchi/test";
const isMain = require.main === module;
if (process.env.NODE_ENV === "test") {
  isMain && cancelAll();
  test("ok", () => {
    // write here
  });
  run({ isMain });
}
```

It's helpful hack if you want `with dependency` mode and cancel others.

### with Deno

**CAUTION** I DO NOT reccomend to leave test codes on `deno` because it causes runtime cost on any case. If you want to use, comment out is needed.

```ts
/* === test start === */
import { run, test } from "http://cdn.skypack.dev/@mizchi/test";
const isMain = import.meta.main;
if (isMain) {
  test("ok", () => {
    // write here
  });
  run({ isMain });
}
```

## Related

- [volument/baretest: An extremely fast and simple JavaScript test runner.](https://github.com/volument/baretest)
- [Unit testing - Rust By Example](https://doc.rust-lang.org/rust-by-example/testing/unit_testing.html)

## LICENSE

MIT