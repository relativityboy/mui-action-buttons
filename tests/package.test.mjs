import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AIconButton } from "@relativity/mui-action-buttons";

const require = createRequire(import.meta.url);
const { ThemeProvider, createTheme } = require("@mui/material");
const theme = createTheme({
    palette: { primary: { main: "#ff00ff" } },
    components: { MuiButton: { defaultProps: { size: "large" } } },
});

for (const [format, load] of [
    ["ESM", () => AIconButton],
    ["CommonJS", () => require("@relativity/mui-action-buttons").AIconButton],
]) {
    test(`${format} entry loads and uses the application's MUI theme`, () => {
        const Button = load();
        const html = renderToStaticMarkup(
            React.createElement(ThemeProvider, { theme },
                React.createElement(Button, { onClick: async () => {} }, "Save")),
        );
        assert.match(html, /#ff00ff/);
        assert.match(html, /MuiButton-sizeLarge/);
        assert.match(html, />Save<\/button>/);
    });
}

test("the documented stylesheet export resolves to the shipped CSS", () => {
    const cssPath = require.resolve("@relativity/mui-action-buttons/styles.css");
    assert.match(readFileSync(cssPath, "utf8"), /button\.actn-button\.success/);
});

test("both built entry points preserve their client boundary", () => {
    for (const entry of ["index.cjs", "index.mjs"]) {
        const code = readFileSync(new URL(`../dist/${entry}`, import.meta.url), "utf8");
        assert.match(code, /^"use client";/);
    }
});
