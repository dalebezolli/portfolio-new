import { CenterContainer } from "../components/CenteredContainer";
import ProjectDisplay from "../components/ProjectDisplay";

export function Index() {
	return (
		<CenterContainer>
			<ProjectDisplay name="Cool Project" img="test" className="grow" />
			<div className="flex flex-col gap-4 grow-[0.3]">
				<ProjectDisplay name="Cool Small Project" img="test" small={true} />
				<ProjectDisplay name="Cool Small Project 2" img="test" small={true} />
			</div>
		</CenterContainer>
	);
}
