import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h1: ({children}) => <h1 className="mb-5 text-3xl">{children}</h1>,
		h2: ({children}) => <h2 className="mb-5 text-xl">{children}</h2>,
		p: ({children}) => <p className="mb-5">{children}</p>,
		pre: ({children}) => <pre className="mb-5 p-4 rounded-xl bg-[#1a1b26] text-[#9aa5ce]">{children}</pre>,
		...components,
	}
}
