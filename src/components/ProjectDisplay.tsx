import { PropsWithChildren } from "preact/compat";
import Icon from "./Icon";

type ProjectDisplayProps = {
	name: string;
	img: string;
	techTags?: string[];

	small?: boolean;

	githubUrl?: string;
	liveUrl?: string;

	className?: string;
};

export default function ProjectDisplay({name, small=false, className=""}: ProjectDisplayProps) {
	return (
		<div className={`
			group relative
			${small ? 'h-[260px]' : 'h-[536px]'}
			overflow-clip
			flex flex-col justify-end
			rounded-xl
			bg-zinc-900 font-primary
			${className}`}>

			<div className={`absolute inset-0 transition-all ${small ? 'group-hover:brightness-50' : ''}`}>
				<div className="absolute top-[10%] left-[10%] w-[80px] h-[80px] rotate-3 bg-blue-600 rounded-md shadow-2xl"></div>
				<div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] rotate-12 bg-blue-400 rounded-md shadow-2xl"></div>
				<div className="absolute top-[20%] right-[10%] w-[150px] h-[150px] rotate-45 bg-purple-400 rounded-md shadow-2xl"></div>
				<div className="absolute bottom-[20%] right-[10%] w-[80px] h-[80px] rotate-[36deg] bg-purple-600 rounded-md shadow-2xl"></div>
			</div>

			<section className={`
				p-8
				flex flex-col gap-1
				${small ? 'h-full justify-end' :''}
				${small ? '' : 'bg-linear-60 from-zinc-950/10 to-zinc-600/10'}
				opacity-0 group-hover:opacity-100
				backdrop-blur-2xl

				${small ? '' :'translate-y-20 group-hover:translate-y-0'}

				transition-all ease-out duration-300`}>
				<p className="font-bold text-2xl">{name}</p>

				<div className="h-[24px]">
				</div>

				<div className="pt-4 flex flex-wrap gap-8">
					<ProjectActionButton><Icon icon="github" />Source</ProjectActionButton>
					<ProjectActionButton><Icon icon="location-arrow" />Live</ProjectActionButton>
				</div>
			</section>
		</div>
	);
}

function ProjectActionButton({href, children}: PropsWithChildren<{href?: string}>) {
	return (
		<a className="py-1.5 flex items-center gap-2 cursor-pointer" href={href}>
				{children}
		</a>
	);
}
