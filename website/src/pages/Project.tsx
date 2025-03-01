import { PropsWithChildren } from "preact/compat";
import { CenterContainer } from "../components/CenteredContainer";
import { ProjectRecord } from "../types";

export default function Project({children, project}: ProjectProps) {
	return (
		<CenterContainer>
			<h2>Project: {project.title}</h2>
			{children}
		</CenterContainer>
	);
}

type ProjectProps = PropsWithChildren<{
	project: ProjectRecord;
}>;
