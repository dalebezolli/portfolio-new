import { JSX } from "preact/jsx-runtime"
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "preact/jsx-runtime";
import { useMDXComponents } from "@mdx-js/preact";
import { Index } from "./pages/Index";
import { NotFound } from "./pages/NotFound";
import Project from "./pages/Project";
import { ArticleRecord, ProjectRecord } from "./types";
import { get } from "./utils/network";
import { MDXProps } from "mdx/types";
import Article from "./pages/Article";

const routes: Record<string, JSX.Element | ((params: any) => Promise<JSX.Element>)> = {
	'/': <Index />,
	'/work/{id}': async (params) => {
		let base = import.meta.env.VITE_CMS_EXTERNAL_URL;
		if(typeof window == 'undefined') {
			base = import.meta.env.VITE_CMS_INTERNAL_URL;
		}

		const details = await get<ProjectRecord>({ url: new URL(`${base}/projects/${params.id}`)})
		if(details == null) return <NotFound />

		let Html: (props: any) => JSX.Element;
		try {
			Html = await compileMarkdown(details.description);
		} catch(error) {
			console.error("Error while compiling HTML:", error);
			return <NotFound />
		}
		return (
			<Project project={details}>
				<Html />
			</Project>
		)
	},
	'/article/{id}': async (params) => {
		let base = import.meta.env.VITE_CMS_EXTERNAL_URL;
		if(typeof window == 'undefined') {
			base = import.meta.env.VITE_CMS_INTERNAL_URL;
		}

		const details = await get<ArticleRecord>({ url: new URL(`${base}/articles/${params.id}`)})
		if(details == null) return <NotFound />

		let Html: (props: any) => JSX.Element;
		try {
			Html = await compileMarkdown(details.article);
		} catch(error) {
			console.error("Error while compiling HTML:", error);
			return <NotFound />
		}

		return (
			<Article article={details}>
				<Html components={mdxProps} />
			</Article>
		)
	},
	'.': <NotFound />,
}

/**
 * Get's route based on the "/path"
 * Is managed based on the routes object defined in this file
 * */
export async function getRoute(path: string): Promise<JSX.Element> {
	let Html = routes['.'] as JSX.Element;

	for(const [route, details] of Object.entries(routes)) {
		const regex = prepareRouteRegex(route);
		if(!regex.test(path)) continue;

		if(typeof details != 'function') {
			Html = details;
			break;
		}

		Html = await details(regex.exec(path)!.groups);
	}

	return Html;
}

function prepareRouteRegex(route: string): RegExp {
	if(!route.includes('{')) {
		return new RegExp(`^${route}$`);
	}

	let routeChunks = route.split('/');
	for(let i = 0; i < routeChunks.length; i++) {
		if(!routeChunks[i].startsWith('{')) continue;
		const dynamicId = routeChunks[i].replace(/[{}]/g, '');

		routeChunks[i] = `(?<${dynamicId}>.*)`;
	}

	const regex = new RegExp(`^${routeChunks.join('/')}$`);
	return regex;
}

var mdxProps = {
	h2(props: any) {
		return <h2 className="m-16 font-bold text-lg" {...props} />
	},
}

async function compileMarkdown(markdown: string): Promise<(props: MDXProps) => JSX.Element> {
	const baseUrl = import.meta.url;
	const compiledData = await compile(markdown, {
		format: 'mdx',
		providerImportSource: '@mdx-js/preact',
		jsxImportSource: 'preact',
		outputFormat: 'function-body',
		baseUrl,
	});

	const data = await run(compiledData, {
		...runtime,
		useMDXComponents,
		baseUrl,
	});

	return data.default;
}
