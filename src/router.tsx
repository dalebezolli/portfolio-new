import { JSX } from "preact/jsx-runtime"
import { compileSync, runSync } from "@mdx-js/mdx";
import * as runtime from "preact/jsx-runtime";
import { useMDXComponents } from "@mdx-js/preact";
import { Index } from "./pages/Index";

export const routes: Record<string, JSX.Element> = {
	'/': <Index />,
}

/**
 * Get's route based on the "/path"
 * Is managed based on the routes object defined in this file
 * */
export async function getRoute(path: string) {
	let html: preact.ComponentChildren;
	if(!path.startsWith('/resource')) {
		html = routes[path] ?? routes['/'];
	} else {
		// Ignore this for now, it won't be set-up or used yet.
		const MDXContent = await getResource(import.meta.url);
		html = <MDXContent />
	}

	return html;
}

async function getResource(baseUrl?: string) {
	let cmsResource = '';
	try {
		const response = await fetch('http://localhost:6363');
		const resources = await response.json();

		cmsResource = resources.map((res: any) => res.mdx).join("\n");
	} catch(err) {
		console.error('Failed to collect data:', err);
	}

	const compiledData = compileSync(cmsResource, {
		format: 'mdx',
		providerImportSource: '@mdx-js/preact',
		jsxImportSource: 'preact',
		outputFormat: 'function-body',
		baseUrl,
	});

	const data = runSync(compiledData, {
		...runtime,
		useMDXComponents,
		baseUrl,
	});

	return data.default;
}
