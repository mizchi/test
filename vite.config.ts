import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "require.main === module": JSON.stringify(false),
    "require.main": JSON.stringify(null),
  },
  build: {
    target: "es2020",
    lib: process.env.LIB && {
      entry: "src/index",
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "cjs") {
          return `index.cjs`;
        }
        if (format === "es") {
          return `index.js`;
        }
        return "";
      },
    },
  },
});
