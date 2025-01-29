import { CenterContainer } from "../components/CenteredContainer";
import ProjectDisplay from "../components/ProjectDisplay";

export function Index() {
	return (
		<CenterContainer>
			<SectionWork />
		</CenterContainer>
	);
}

function SectionWork() {
	return (
		<div className="py-16">
			<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading text-transparent bg-clip-text bg-linear-to-r from-white to-white/20 transition-colors">Work</h2>

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
