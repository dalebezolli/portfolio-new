import { CenterContainer } from "../components/CenteredContainer";
import ProjectDisplay from "../components/ProjectDisplay";

export function Index() {
	return (
		<CenterContainer>
			<SectionWork />
			<SectionAbout />
		</CenterContainer>
	);
}

function SectionWork() {
	return (
		<div className="pt-16 pb-48">
			<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">Work</h2>

			<div className="flex flex-wrap gap-2 sm:gap-4 justify-center items-center">
				<ProjectDisplay name="Cool Project" img="test" className="grow" />
				<div className="flex flex-col gap-2 sm:gap-4 grow md:grow-[0.3]">
					<ProjectDisplay name="Cool Small Project" img="test" small={true} />
					<ProjectDisplay name="Cool Small Project 2" img="test" small={true} />
				</div>
			</div>
		</div>
	);
}

function SectionAbout() {
	return (
		<div className="pt-16 pb-48">
			<div>
				<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">About Me</h2>
				<p className="pb-4 text-zinc-500 max-w-[60ch]">
					I started working with computers early in my life, programming games and learning all about these complex machines. Now, I get to study about them at IHU as a Computer Engineer, but I haven’t stopped there...
				</p>

				<p className="text-zinc-500 max-w-[60ch]">
					Engineering is my love. I enjoy solving problems and packing them in elegant and functional programs that have the user in the forefront.
				</p>
			</div>

			<div className="flex flex-col lg:items-end max-lg:mt-8">
				<div>
					<h3 className="w-fit pb-2 text-4xl md:text-2xl font-heading font-bold text-zinc-600">What I excel at</h3>

					<div className="flex gap-12">
						<div>
							<h4 className="font-bold text-zinc-400 pb-1">Languages</h4>
							<p className="text-zinc-500">HTML</p>
							<p className="text-zinc-500">CSS</p>
							<p className="text-zinc-500">JavaScript</p>
						</div>

						<div>
							<h4 className="font-bold text-zinc-400 pb-1">Frameworks/Libraries</h4>
							<p className="text-zinc-500">ReactJS</p>
							<p className="text-zinc-500">TailwindCSS</p>
						</div>

						<div>
							<h4 className="font-bold text-zinc-400 pb-1">Tools</h4>
							<p className="text-zinc-500">Git & Github</p>
							<p className="text-zinc-500">Figma</p>
							<p className="text-zinc-500">Rubber Ducky</p>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}
