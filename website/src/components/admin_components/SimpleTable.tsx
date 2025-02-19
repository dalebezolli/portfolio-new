import { HTMLAttributes, PropsWithChildren, TableHTMLAttributes } from "preact/compat";

export function STable({children, className="", ...rest}: PropsWithChildren<TableHTMLAttributes>) {
	return (
		<table className={`w-full overflow-clip ${className}`} {...rest}>
			{children}
		</table>
	);
}

export function THead({children, className=""}: PropsWithChildren<{className?: string}>) {
	return (
		<thead className={`font-bold text-gray-200 ${className}`}>
			{children}
		</thead>
	);
}

export function THeadRow({children, className="", ...rest}: PropsWithChildren<HTMLAttributes<HTMLTableRowElement>>) {
	return (
		<tr className={className} {...rest}>
			{children}
		</tr>
	);
}

export function TBody({children}: PropsWithChildren) {
	return (
		<tbody className="text-gray-400">
			{children}
		</tbody>
	);
}

export function TRow({children, className="", ...rest}: PropsWithChildren<HTMLAttributes<HTMLTableRowElement>>) {
	return (
		<tr className={`${className}`} {...rest}>
			{children}
		</tr>
	);
}
