import { HTMLAttributes, JSX, PropsWithChildren, TableHTMLAttributes } from "preact/compat";

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

type TRowProps = PropsWithChildren<HTMLAttributes<HTMLTableRowElement> & {
	entry?: any,
	onRowClick?: (e: JSX.TargetedMouseEvent<HTMLTableRowElement>, entry?: any) => void,
}>;

export function TRow({children, entry, onRowClick, className="", ...rest}: TRowProps) {
	function onClickManaged(e: JSX.TargetedMouseEvent<HTMLTableRowElement>) {
		onRowClick && onRowClick(e, entry);
	}

	return (
		<tr onClick={onClickManaged} className={`${className}`} {...rest}>
			{children}
		</tr>
	);
}
