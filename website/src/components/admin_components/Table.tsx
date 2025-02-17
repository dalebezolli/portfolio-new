type TableProps<T extends object> = {
	columns: {title: string, options?: ColumnOptions}[];
	records: T[];
	className?: string;
};

type ColumnOptions = {
	width?: string;
};

export default function Table<T extends object>({columns, records, className=""}: TableProps<T>) {
	return (
		<div className="grow rounded-xl bg-gray-900 overflow-clip">
			<table className={`w-full overflow-clip bg-gray-900 ${className}`}>
				<thead className="font-semibold text-gray-200 border-b-2 border-gray-800">
					<tr>
						<td className="w-[1%] text-center"><div className="p-4 w-fit"><input type="checkbox" /></div></td>
						{ columns.map(col => (
							<td className="whitespace-nowrap" style={{ width: col.options?.width ?? "1%"}}>
								<button className="p-4 cursor-pointer">{col.title.toUpperCase()}</button>
							</td>
						))}
					</tr>
				</thead>

				<tbody className="text-gray-400">
					{ records.map(item => (
						<tr className="hover:bg-gray-700 transition-colors cursor-pointer">
							<td className="text-center"><div className="p-4 w-fit"><input type="checkbox" /></div></td>
							{
								Object.values(item).map(cell => (
									<td><p className="p-4">{cell}</p></td>
								))
							}
						</tr>
					))}
				</tbody>
			</table>

			{ records.length == 0 && (
				<div className="h-full flex justify-center items-center text-gray-400">
					No records available
				</div>
			)}
		</div>
	);
}
