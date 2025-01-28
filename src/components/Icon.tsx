type IconProps = {
	icon: keyof typeof IconTypes;
	size?: number;
	colorFill?: string;
	colorStroke?: string;
};

export default function Icon({icon, size=16, colorFill="fill-white", colorStroke="stroke-white"}: IconProps) {
	return IconTypes[icon](size, colorFill, colorStroke);
}


const IconTypes = {
	'test': (_: number, __: string, ___: string) => (
		<div>
			Icon
		</div>
	),
};
