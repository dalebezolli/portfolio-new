import { HTMLAttributes } from "preact/compat";

export default function Select({data, className="", ...rest}: SelectProps) {
	return (
		<select {...rest}
			className={`px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl font-bold placeholder:font-normal ${className}`}>
			{
				data.map(({name, value}) => (
					<option value={value}>{name}</option>
				))
			}
		</select>
	);
}

type SelectProps = {
	data: SelectData[];
	className?: string;
} & HTMLAttributes<HTMLSelectElement>;

type SelectData = {
	name: string;
	value: string;
};
