import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		h1: ({children}) => <h1 className="mb-5 text-3xl">{children}</h1>,
		h2: ({children}) => <h2 className="mt-15 md:mt-20 mb-5 md:mb-10 font-bold text-2xl text-fuchsia-400">{children}</h2>,
		p: ({children}) => <p className="mb-5 text-lg [aside>*]:text-base text-justify text-zinc-200 [h1+*]:text-zinc-400">{children}</p>,
		pre: ({children}) => <pre className="-mx-4 mb-5 p-4 text-sm rounded-md bg-[#1a1b26] text-[#9aa5ce]">{children}</pre>,
		code: ({children}) => <code className="not-[pre_*]:px-2 not-[pre_*]:py-1 not-[pre_*]:-my-1 not-[pre_*]:mx-2 not-[pre_*]:bg-[#1a1b26] not-[pre_*]:text-[#9aa5ce] not-[pre_*]:rounded-md">{children}</code>,
		ul: ({children}) => <ul className="mb-5 ml-[15px] list-disc marker:text-blue-400">{children}</ul>,
		li: ({children}) => <li className="mb-3">{children}</li>,
		...components,
	}
}
