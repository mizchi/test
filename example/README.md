# Example

## test

- `yarn test`
- `yarn test-only`

## build with vite

```bash
$ yarn build
vite v2.6.2 building for production...
✓ 4 modules transformed.
dist/example.es.js   0.10 KiB / gzip: 0.08 KiB

# check DCE
$ cat dist/example.es.js
function add(a, b) {
  return a + b;
}
function sub(a, b) {
  return a - b;
}
export { add, sub };
```