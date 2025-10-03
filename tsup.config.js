import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["index.mjs"],
    format: ["esm", "cjs"],
    cts: true,
    minify: true,
    target: "esnext",
    bundle: true,
    platform: "node",
    external: [
        'fs',
        'fs/promises',
        'os',
        'stream',
        'events',
        'node:path',
        'node:fs/promises',
        'node:stream',
        'path',
        '*.css'
    ],
    loader: {
        ".css": "file",
    }
});
