import React, { HTMLAttributes, PropsWithChildren, useState } from "preact/compat";
import Icon, { IconName, IconNameTech } from "./Icon";

type ProjectDisplayProps = {
	name: string;
	techTags?: string[];

	small?: boolean;

	githubUrl?: string;
	liveUrl?: string;

	img_primary?: string;
	img_secondary?: string;
	img_tertiary?: string;

	className?: string;
	color?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function ProjectDisplay({
	name, small=false, techTags=[],
	githubUrl="", liveUrl="", className="",
	img_primary="", img_secondary="", img_tertiary="", color="",
	...rest
}: ProjectDisplayProps) {
	const [tiltX, setTiltX] = useState(0);
	const [tiltY, setTiltY] = useState(0);

	function onHover(e: React.MouseEvent<HTMLDivElement>) {
		const {clientX, clientY} = e;
		const {x: cardX, y: cardY, width, height} = e.currentTarget.getBoundingClientRect();
		const posX = (clientX - cardX) / width - 0.5;
		const posY = (clientY - cardY) / height - 0.5;

		setTiltX(posX);
		setTiltY(posY);
	}

	function onHoverEnd() {
		setTiltX(0);
		setTiltY(0);
	}

	return (
		<div className={`
			group relative
			h-[260px] ${small ? '' : 'md:h-[536px]'}
			xs:min-w-[360px]
			overflow-clip
			flex flex-col justify-end
			rounded-xl
			bg-zinc-900 font-primary


			shadow-3xl shadow-black/80

			${small ? '' : 'hover:overflow-visible hover:z-10'}
			${className}`}

			style={{transformStyle: 'preserve-3d', transform: `rotateY(${tiltX * 10}deg) rotateX(${tiltY * 10}deg)`}}
			onMouseMove={onHover}
			onMouseLeave={onHoverEnd}
			{...rest}>
			<div className={`
				absolute inset-0 overflow-clip rounded-xl
				group-hover:bg-highlight
				md:group-hover:brightness-50 ${small ? '' : 'md:group-hover:brightness-100'}	
				transition-all`}
				style={{ '--color-highlight': `var(--color-${color})` }}>
				<div className="absolute inset-0.5 rounded-xl bg-zinc-900 z-[2]">
					<div className="
						absolute
						w-[1px] h-[1px] top-[32%] left-[25%]

						transition-all duration-700 ease-in-out
						rounded-md shadow-projectdisplay group-hover:shadow-projectdisplay-hover shadow-fuchsia-400 overflow-clip">
					</div>

					<div className="
						absolute
						w-[1px] h-[1px] bottom-[32%] right-[25%] scale-75

						transition-all duration-1000 delay-100 ease-in-out
						rounded-md shadow-projectdisplay group-hover:shadow-projectdisplay-hover shadow-purple-400/60 overflow-clip">
					</div>
				</div>
			</div>

			<div className={`
				z-[3] ${small ? '' : 'translate-z-1'} absolute inset-0.5 rounded-xl
				transition-all
				md:group-hover:brightness-50

				perspective-[400px]
				overflow-clip ${small ? '' : 'md:group-hover:brightness-100'}`}>
				<div className="
					absolute
					bottom-[2%] right-[10%]
					scale-105 group-hover:scale-[101%]
					group-hover:bottom-[0%] group-hover:right-[8%]
					-rotate-y-2 rotate-z-2 translate-z-10 group-hover:translate-z-20

					transition-all duration-500 ease-in-out
					rounded-md shadow-3xl shadow-black/25 overflow-clip">
					{img_tertiary && <img width={300} src={img_tertiary} />}
				</div>

				<div className={`
					absolute
					${small ?
						'bottom-[-10%] left-[-8%] scale-75' :
						'bottom-[22%] left-[12%] scale-105 group-hover:scale-[101%] group-hover:bottom-[20%] group-hover:left-[18%]'
					}
					rotate-x-2 rotate-y-12 -rotate-z-12 ${small ? '' : 'translate-z-10 group-hover:translate-z-20'}

					transition-all duration-500 ease-in-out
					rounded-md shadow-3xl shadow-black/25 overflow-clip`}>
					{img_secondary && <img width={300} src={img_secondary} />}
				</div>
			</div>

			<div className={`z-[4] translate-z-1 absolute inset-0 transition-all md:group-hover:brightness-50 perspective-[400px] ${small ? '' : 'md:group-hover:brightness-100'}`}>
				<div className={`
					absolute

					${small ?
						'top-[-10%] right-[1%] scale-75' :
						'top-[2%] right-[15%] group-hover:scale-105 group-hover:top-0 group-hover:right-[10%]'
					}

					rotate-x-2 -rotate-y-12 rotate-z-12 translate-z-1

					transition-all duration-500 ease-in-out
					rounded-md shadow-3xl shadow-black/50 overflow-clip`}>
					{img_primary && <img width={400} src={img_primary} />}
				</div>
			</div>

			<section className={`
				absolute ${small ? 'inset-1 rounded-xl' : 'bottom-0 inset-x-0'} z-10
				p-8
				flex flex-col gap-1
				h-full justify-end ${small ? '' :'md:h-auto md:justify-stretch'}
				${small ? '' : 'md:bg-linear-60 from-zinc-950/90 to-zinc-600/50'}
				md:opacity-0 group-hover:opacity-100
				backdrop-blur-sm rounded-b-xl

				${small ? '' :'md:translate-y-20 md:group-hover:translate-y-0'}

				transition-all ease-out duration-[250ms]`} style={{transform: 'translateZ(10px)'}}>
				<p className="font-semibold text-2xl">{name}</p>

				<div className="h-[24px] flex gap-2">
					{
						techTags.map(tag => (
							<TechIcon icon={`tech-${tag}` as IconNameTech} />
						))
					}
				</div>

				<div className="pt-4 flex flex-wrap gap-8">
					{githubUrl.length ? <ProjectActionButton icon="github" href={githubUrl}>Source</ProjectActionButton> : '' }
					{liveUrl.length ? <ProjectActionButton icon="location-arrow" href={liveUrl}>Live</ProjectActionButton> : ''}
				</div>
			</section>
		</div>
	);
}

function TechIcon({icon}: {icon: IconNameTech}) {
	return <div className="flex justify-center items-center p-1 bg-white/5 rounded-xs"><Icon icon={icon} size={16} /></div>;
}

function ProjectActionButton({href, icon, children}: PropsWithChildren<{href?: string, icon?: IconName}>) {

	return (
		<a className="group/action py-1.5 flex flex-col items-center font-medium cursor-pointer hover:text-blue-200" href={href} target="_blank">
			<div className="flex items-center gap-2 group-hover/action:translate-y-[-20%] transition-transform ease-out">
				{icon && <Icon icon={icon} colorFill="fill-white group-hover/action:fill-blue-100 transition-color" />}
				{children}
			</div>

			<div className="w-0 group-hover/action:w-[75%] h-[2px] bg-blue-200 transition-all ease-out"></div>
		</a>
	);
}
