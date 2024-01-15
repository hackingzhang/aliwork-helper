import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/aliwork-helper.js",
      format: "umd",
      name: "Awh",
    },
    {
      file: "dist/aliwork-helper.min.js",
      format: "umd",
      name: "Awh",
      plugins: [terser()],
    },
  ],
};
