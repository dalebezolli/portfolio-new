import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h1: ({children}) => <h1 className="mb-5 text-3xl">{children}</h1>,
		h2: ({children}) => <h2 className="mt-15 md:mt-20 mb-5 md:mb-10 font-bold text-2xl text-fuchsia-400">{children}</h2>,
		p: ({children}) => <p className="mb-5 text-lg text-justify text-zinc-200 [h1+*]:text-zinc-400">{children}</p>,
		pre: ({children}) => <pre className="-mx-4 mb-5 p-4 text-sm rounded-xl bg-[#1a1b26] text-[#9aa5ce]">{children}</pre>,
		...components,
	}
}
