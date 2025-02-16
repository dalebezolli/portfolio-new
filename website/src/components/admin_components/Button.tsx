import { ButtonHTMLAttributes } from "preact/compat";
import Icon, { IconName } from "../Icon";

type PrimaryButtonProps = {
	text?: string;
	icon?: IconName;
	selected?: boolean;
} & ButtonHTMLAttributes;

export default function Button({text, icon, disabled=false, selected=false, className="", ...rest}: PrimaryButtonProps) {
	return (
		<button className={`
			group px-4 py-2 flex gap-2 items-center
			${selected ? 'bg-gray-800' : ''} hover:bg-gray-800 focus:bg-gray-800 rounded-xl
			font-bold ${selected ? 'text-violet-400' : 'text-gray-400'} ${disabled ? '' : 'hover:text-violet-400 focus:text-violet-400'}
			${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors ${className}`} {...rest}>

			{icon && <Icon icon={icon} colorFill={`${selected ? 'fill-violet-400' : 'fill-gray-400'} ${disabled ? '' : 'group-hover:fill-violet-400 group-focus:fill-violet-400'}`} />}
			{text}
		</button>
	);
}
