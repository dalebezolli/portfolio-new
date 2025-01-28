import ProjectDisplay from "../components/ProjectDisplay";

export function App() {
	return (
		<div className="bg-black text-white min-w-screen">
			<div className="max-w-[1080px] h-screen bg-black mx-auto text-white flex gap-4 justify-center items-center">
				<ProjectDisplay name="Cool Project" img="test" className="grow" />
				<div className="flex flex-col gap-4 grow-[0.3]">
					<ProjectDisplay name="Cool Small Project" img="test" small={true} />
					<ProjectDisplay name="Cool Small Project 2" img="test" small={true} />
				</div>
			</div>
		</div>
	)
}
