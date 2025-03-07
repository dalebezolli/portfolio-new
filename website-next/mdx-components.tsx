import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h2: ({children}) => <h3 className="text-xl">{children}</h3>,
		p: ({children}) => <p className="pb-5">{children}</p>,
		pre: ({children}) => <pre className="p-4 rounded-xl bg-[#1a1b26] text-[#9aa5ce]">{children}</pre>,
		...components,
	}
}
