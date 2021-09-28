import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2019",
    lib: process.env.LIB && {
      entry: "src/index",
      formats: ["es", "cjs"],
      fileName: (format) => {
        console.log("format", format);
        if (format === "cjs") {
          return `testio.cjs`;
        }
        if (format === "es") {
          return `testio.js`;
        }
        return "";
      },
    },
  },
});
