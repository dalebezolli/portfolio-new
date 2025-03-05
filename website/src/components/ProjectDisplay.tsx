import React, { HTMLAttributes, PropsWithChildren, useState } from "preact/compat";
import Icon, { IconName, IconNameTech } from "./Icon";

type ProjectDisplayProps = {
	projectId: string;
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
	whiteTheme?: boolean;
} & HTMLAttributes<HTMLAnchorElement>;

export default function ProjectDisplay({
	projectId, name, small=false, techTags=[],
	githubUrl="", liveUrl="", className="",
	img_primary="", img_secondary="", img_tertiary="", color="", whiteTheme=false,
	...rest
}: ProjectDisplayProps) {
	const [tiltX, setTiltX] = useState(0);
	const [tiltY, setTiltY] = useState(0);

	function onHover(e: React.MouseEvent<HTMLAnchorElement>) {
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
		<a href={projectId ? `/work/${projectId}` : ''} className={`
			group relative
			h-[260px] ${small ? '' : 'md:h-[536px]'}
			xs:min-w-[360px]
			overflow-clip
			flex flex-col justify-end
			rounded-xl
			${whiteTheme ? "bg-zinc-200" : "bg-zinc-900"} font-primary


			shadow-3xl shadow-black/80 hover:shadow-highlight/20
			transition-shadow duration-300

			${small ? '' : 'hover:overflow-visible hover:z-10'}
			${className}`}

			style={{transformStyle: 'preserve-3d', transform: `rotateY(${tiltX * 10}deg) rotateX(${tiltY * 10}deg)`, '--color-highlight': `var(--color-${color})`}}
			onMouseMove={onHover}
			onMouseLeave={onHoverEnd}
			{...rest}>
			<div className={`
				absolute inset-0 overflow-clip rounded-xl
				group-hover:bg-highlight
				md:group-hover:brightness-50 ${small ? '' : 'md:group-hover:brightness-100'}
				transition-all`}>
				<div className={`absolute inset-0.5 rounded-xl ${whiteTheme ? "bg-zinc-200" : "bg-zinc-900"} z-[2]`}>
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
				<div className="absolute inset-0" style={{ '--color-highlight': `var(--color-${color})` }}>
					<div className="absolute -left-8 top-8 w-[150%] h-0.5 bg-highlight/80 -rotate-[20deg]"></div>
					<div className="absolute -left-8 top-16 w-[150%] h-0.5 bg-highlight/50 -rotate-[20deg]"></div>
					<div className="absolute -left-8 top-24 w-[150%] h-0.5 bg-highlight/20 -rotate-[20deg]"></div>
				</div>

				<div className={`
					absolute


					${ !small ? `w-[300px] aspect-video ${whiteTheme ? "bg-zinc-200" : "bg-zinc-900"}` : ""}

					bottom-[2%] right-[10%]
					scale-105 group-hover:scale-[101%]
					group-hover:bottom-[0%] group-hover:right-[8%]
					-rotate-y-2 rotate-z-2 translate-z-10 group-hover:translate-z-20

					transition-all duration-500 ease-in-out
					rounded-md shadow-3xl shadow-black/25 group-hover:shadow-highlight/25 overflow-clip`}>
					{ img_tertiary && <img width={300} src={img_tertiary} />}
				</div>

				<div className={`
					absolute

					${whiteTheme ? "bg-zinc-200" : "bg-zinc-900"}

					${!small ?
						'w-[300px] aspect-video bottom-[22%] left-[12%] scale-105 group-hover:scale-[101%] group-hover:bottom-[20%] group-hover:left-[18%]' :
						''
					}
					rotate-x-2 rotate-y-12 -rotate-z-12 ${small ? '' : 'translate-z-10 group-hover:translate-z-20'}

					transition-all duration-500 ease-in-out
					rounded-md shadow-3xl shadow-black/25 group-hover:shadow-highlight/25 overflow-clip`}>
					{img_secondary != "" && <img width={300} src={img_secondary} />}
				</div>
			</div>

			<div className={`z-[4] absolute ${small ? 'inset-1 overflow-clip' : 'inset-0'} transition-all md:group-hover:brightness-50 ${small ? '' : 'translate-z-1 perspective-[400px] md:group-hover:brightness-100'}`}>
				<div className={`
					absolute

					w-[400px] aspect-video ${whiteTheme ? "bg-zinc-200" : "bg-zinc-900"}

					${small ?
						`${img_secondary != "" ? "top-[-10%] right-[1%]" : "top-[8%] right-[5%]" } scale-75` :
						'top-[2%] right-[15%] group-hover:scale-105 group-hover:top-0 group-hover:right-[10%] translate-z-1'
					}

					rotate-x-2 -rotate-y-12 rotate-z-12

					transition-all duration-500 ease-in-out
					rounded-md shadow-3xl shadow-black/25 group-hover:shadow-highlight/5 overflow-clip`}>
					{img_primary != "" && <img width={400} src={img_primary} />}
				</div>
			</div>

			<section className={`
				absolute ${small ? 'inset-0.5 rounded-xl' : 'bottom-0 inset-x-0'} z-10
				p-8
				flex flex-col gap-1
				justify-end ${small ? '' :'h-full md:h-auto md:justify-stretch'}
				${small ? '' : 'md:bg-linear-60 from-zinc-950/90 to-zinc-600/50'}
				md:opacity-0 group-hover:opacity-100
				backdrop-blur-sm rounded-b-xl

				${small ? '' :'md:translate-y-20 md:group-hover:translate-y-0'}

				transition-all ease-out duration-[250ms]`} style={{transform: small ? '' : 'translateZ(10px)'}}>
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
		</a>
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
