import { ButtonHTMLAttributes, JSX } from "preact/compat";
import Icon, { IconName } from "../Icon";

type PrimaryButtonProps = {
	text?: string;
	icon?: IconName;
	color?: "default" | "highlight" | "success" | "warning" | "error";
	active?: boolean;
} & ButtonHTMLAttributes;

export default function Button({text, icon, color, disabled=false, active=false, onClick, className="", ...rest}: PrimaryButtonProps) {
	let iconClassName = `${active ? "fill-violet-400" : "fill-gray-400"} ${disabled ? "" : "group-hover:fill-violet-400 group-focus:fill-violet-400"}`;
	let buttonClassName = `${active ? "bg-gray-800" : ""} hover:bg-gray-800 focus:bg-gray-800
		${active ? "text-violet-400" : "text-gray-400"} ${disabled ? "" : "hover:text-violet-400 focus:text-violet-400"}`;

	if(color == "highlight") {
		buttonClassName = `bg-violet-800 hover:bg-violet-600 focus:bg-violet-600 text-violet-200 hover:text-violet-50 focus:text-violet-50`;
		iconClassName = `fill-violet-200 group-hover:fill-violet-50 group-focus:fill-violet-50`;
	}

	if(color == "success") {
		buttonClassName = `${disabled ? "bg-emerald-950 text-emerald-800" : "bg-emerald-800 hover:bg-emerald-600 focus:bg-emerald-600 text-emerald-200 hover:text-emerald-50 focus:text-emerald-50 "}`;
		iconClassName = `${disabled ? "fill-emerald-800" : "fill-emerald-200 group-hover:fill-emerald-50 group-focus:fill-emerald-50"}`;
	}

	if(color == "warning") {
		buttonClassName = `${disabled ? "bg-amber-950 text-amber-800" : "bg-amber-800 hover:bg-amber-600 focus:bg-amber-600 text-amber-200 hover:text-amber-50 focus:text-amber-50 "}`;
		iconClassName = `${disabled ? "fill-amber-800" : "fill-amber-200 group-hover:fill-amber-50 group-focus:fill-amber-50"}`;
	}

	if(color == "error") {
		buttonClassName = `${disabled ? "bg-red-950 text-red-800" : "bg-red-800 hover:bg-red-600 focus:bg-red-600 text-red-200 hover:text-red-50 focus:text-red-50 "}`;
		iconClassName = `${disabled ? "fill-red-800" : "fill-red-200 group-hover:fill-red-50 group-focus:fill-red-50"}`;
	}

	className += " " + buttonClassName;

	function onClickManaged(e: JSX.TargetedMouseEvent<HTMLButtonElement>) {
		if(disabled == true) return;
		onClick && onClick(e);
	}

	return (
		<button className={`
			group px-4 py-2 flex gap-2 items-center rounded-xl font-bold
			${disabled ? "cursor-not-allowed" : "cursor-pointer"} transition-colors ${className}`} onClick={onClickManaged} {...rest}>
			{icon && <Icon icon={icon} colorFill={iconClassName} />}
			{text}
		</button>
	);
}
