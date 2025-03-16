import { PropsWithChildren } from "react"

export default function Info({title, children}: InfoProps) {
	return (
		<aside className="-mx-4 mb-5 p-4 border-l-4 border-blue-400 bg-[#0D142D] rounded-e-md">
			<h3 className="mb-5 font-bold text-lg">{title}</h3>
			{children}
		</aside>
	);
}

type InfoProps = PropsWithChildren<{
	title: string,
}>;
