import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { readFileSync } from "node:fs";

const { peerDependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const sharedDependencies = Object.keys(peerDependencies);

export default {
    input: "dist/esm/index.js",
    output: [
        { file: "dist/index.cjs", format: "cjs", sourcemap: true, banner: '"use client";' },
        {
            file: "dist/index.mjs",
            format: "esm",
            sourcemap: true,
            banner: '"use client";',
            // MUI 6's icon helper imports a directory that native Node ESM cannot resolve.
            paths: { "@mui/material/utils": "@mui/material" },
        },
    ],
    plugins: [resolve(), commonjs()],
    external: id => sharedDependencies.some(name => id === name || id.startsWith(`${name}/`)),
    onwarn(warning, defaultHandler) {
        // The output banner preserves the client boundary for the whole bundle.
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) {
            return;
        }
        defaultHandler(warning);
    },
};
