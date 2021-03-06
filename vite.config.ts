import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "require.main === module": JSON.stringify(false),
  },
  build: {
    target: "es2019",
    lib: {
      entry: "src/index",
      formats: ["es", "cjs"],
      fileName: (format) => ({ cjs: "index.cjs", es: "index.js" }[format]),
    },
  },
});
