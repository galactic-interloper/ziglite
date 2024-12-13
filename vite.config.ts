/// <reference types="vitest" />

import path from "path";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';

const root_path = (p?: string): string => path.join(__dirname, p ?? '');
const js_path = (p?: string): string => path.join(root_path('js'), p ?? '');

const common_exclude = [
    'node_modules/**',
    'vendor/**',
    'dist/**',
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {
    return {
        plugins: [
            dts({
                entryRoot: js_path(),
                strictOutput: true,
                exclude: [],
                insertTypesEntry: true,
            }),
        ],
        resolve: {
            alias: {
                '@': js_path(''),
                'tests': root_path('tests/js'),
            },
        },
        build: {
            minify: true,
            reportCompressedSize: true,
            lib: {
                entry: js_path('index.ts'),
                name: "Ziglite",
                fileName: "index",
                formats: ["es"],
            },
            rollupOptions: {
                external: ['qs', 'zod'],
            },
        },
        test: {
            include: [
                '**/tests/js/**/*.test.ts',
            ],
            exclude: common_exclude,
            typecheck: {
                enabled: true,
                include: [
                    '**/tests/js/**/*.test-d.ts',
                ],
                exclude: common_exclude,
            },
        },
    };
});
