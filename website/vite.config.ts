import { createRequire } from 'module';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		{enforce: 'pre', ...mdx({ jsxImportSource: 'preact' })},
		preact({
			babel: {
				// Change cwd to load Preact Babel plugins
				cwd: createRequire(import.meta.url).resolve('@preact/preset-vite'),
			},
		}),
	],
})
