import fs from "fs";
import oxide, { extract } from "@esm.sh/oxide-wasm";
import { compile } from "tailwindcss";
import lightningcss, { transform } from "lightningcss-wasm";

await oxide(fs.promises.readFile("./node_modules/@esm.sh/oxide-wasm/pkg/oxide_wasm_bg.wasm"));
await lightningcss("./node_modules/lightningcss-wasm/lightningcss_node.wasm");

async function loadStylesheet(id: string, base: string) {
    if (id === "tailwindcss") {
        return {
            path: "virtual:tailwindcss/index.css",
            base,
            content: fs.readFileSync("./node_modules/tailwindcss/index.css", "utf-8")
        };
    } else if (
        id === "tailwindcss/theme" ||
        id === "tailwindcss/theme.css" ||
        id === "./theme.css"
    ) {
        return {
            path: "virtual:tailwindcss/theme.css",
            base,
            content: fs.readFileSync("./node_modules/tailwindcss/theme.css", "utf-8")
        };
    } else if (
        id === "tailwindcss/utilities" ||
        id === "tailwindcss/utilities.css" ||
        id === "./utilities.css"
    ) {
        return {
            path: "virtual:tailwindcss/utilities.css",
            base,
            content: fs.readFileSync("./node_modules/tailwindcss/utilities.css", "utf-8")
        };
    }

    throw new Error(`The browser build does not support @import for "${id}"`);
}

const code = `<h1 class="text-3xl font-bold underline bg-red-500">
  Hello world!
</h1>`;

const candidate = extract(code);

const compiler = await compile("@import 'tailwindcss';", { loadStylesheet });

const css = compiler.build(candidate);

const result = transform({
    filename: "input.css",
    code: new TextEncoder().encode(css),
})

fs.writeFileSync("./output.css", result.code);
