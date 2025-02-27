import { RouteComponentProps } from "wouter-preact";

export default function Project({params}: RouteComponentProps) {
	return (
		<div className="bg-red-400">Project: {params.id}</div>
	);
}
