import { PropsWithChildren } from "preact/compat";

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
			<section className={`
				p-8
				flex flex-col gap-1
				${small ? 'h-full justify-end' :''}
				${small ? '' : 'bg-linear-60 from-zinc-950/50 to-zinc-600/50'}
				opacity-0 group-hover:opacity-100

				${small ? '' :'translate-y-20 group-hover:translate-y-0'}

				transition-all ease-out duration-300`}>
				<p className="font-bold text-2xl">{name}</p>

				<div className="h-[24px]">
				</div>

				<div className="pt-4 flex flex-wrap gap-8">
					<ProjectActionButton>Source</ProjectActionButton>
					<ProjectActionButton>Live</ProjectActionButton>
				</div>
			</section>
		</div>
	);
}

function ProjectActionButton({ children}: PropsWithChildren<{}>) {
	return (
		<a>
			{children}
		</a>
	);
}
