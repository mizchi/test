import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    // node
    "require.main === module": JSON.stringify(false),
    "require.main == module": JSON.stringify(false),
    // deno
    "import.meta.main": JSON.stringify(false),
  },
});
