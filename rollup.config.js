import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/index.ts",
    output: [
        { file: "dist/index.js", format: "cjs", sourcemap: true },
        { file: "dist/index.mjs", format: "esm", sourcemap: true },
    ],
    plugins: [resolve(), commonjs(), typescript()],
    external: ["react", "react-dom", "@mui/material"]
};
