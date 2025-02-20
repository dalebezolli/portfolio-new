import { PropsWithChildren } from "preact/compat";
import Icon, { IconName, IconNameTech } from "./Icon";

type ProjectDisplayProps = {
	name: string;
	img: string;
	techTags?: string[];

	small?: boolean;

	githubUrl?: string;
	liveUrl?: string;

	className?: string;
};

export default function ProjectDisplay({name, small=false, techTags=[], githubUrl="", liveUrl="", className=""}: ProjectDisplayProps) {
	return (
		<div className={`
			group relative
			h-[260px] ${small ? '' : 'md:h-[536px]'}
			xs:min-w-[360px]
			overflow-clip
			flex flex-col justify-end
			rounded-xl
			bg-zinc-900 font-primary
			${className}`}>

			<div className={`absolute inset-0 transition-all md:group-hover:brightness-50 ${small ? '' : 'md:group-hover:brightness-100'}`}>
				<div className="absolute top-[10%] left-[10%] w-[80px] h-[80px] rotate-3 bg-blue-600 rounded-md shadow-2xl"></div>
				<div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] rotate-12 bg-blue-400 rounded-md shadow-2xl"></div>
				<div className="absolute top-[20%] right-[10%] w-[150px] h-[150px] rotate-45 bg-purple-400 rounded-md shadow-2xl"></div>
				<div className="absolute bottom-[20%] right-[10%] w-[80px] h-[80px] rotate-[36deg] bg-purple-600 rounded-md shadow-2xl"></div>
			</div>

			<section className={`
				p-8
				flex flex-col gap-1
				h-full justify-end ${small ? '' :'md:h-auto md:justify-stretch'}
				${small ? '' : 'md:bg-linear-60 from-zinc-950/10 to-zinc-600/10'}
				md:opacity-0 group-hover:opacity-100
				backdrop-blur-2xl

				${small ? '' :'md:translate-y-20 md:group-hover:translate-y-0'}

				transition-all ease-out duration-[250ms]`}>
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
