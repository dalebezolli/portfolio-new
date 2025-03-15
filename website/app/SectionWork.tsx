"use client";

import ProjectDisplay from "@/components/ProjectDisplay";
import { ProjectRecord } from "@/types";
import { useRef } from "react";

export default function SectionWork({projects}: SectionWorkProps) {
	const refTitle = useRef<HTMLHeadingElement>(null);

	function onTitleHighlight(color: string) {
		if(refTitle.current == null) return;

		refTitle.current.style.setProperty('--tw-gradient-from', `var(--color-${color})`);
		refTitle.current.style.setProperty('--tw-gradient-to', `var(--color-${color}/40)`);

		for(let i = 0; i < refTitle.current.children.length; i++) {
			let spanChild = refTitle.current.children[i] as HTMLSpanElement;
			spanChild.style.color = `var(--color-${color})`;
			spanChild.style.animation = `word-bounce 300ms linear 1 ${i * 50}ms`;
			spanChild.onanimationend = () => {
				spanChild.style.animation = '';
				spanChild.style.color = '';
			}
		}
	}

	return (
		<div id="work" className="pt-16 pb-8">
			<h2 ref={refTitle} className={`
				flex items-end
				w-fit pb-4
				text-4xl md:text-5xl font-heading font-semibold overflow-visible
				text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors`}>
				<span className="h-14 flex items-end transition-colors">W</span>
				<span className="h-14 flex items-end transition-colors">o</span>
				<span className="h-14 flex items-end transition-colors">r</span>
				<span className="h-14 flex items-end transition-colors">k</span>
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr] grid-rows-3 md:grid-rows-2 gap-4 perspective-distant">
				{
					[0,1,2].map((i) => (
						<ProjectDisplay
							key={i}
							projectId={projects[i]?._id ?? ""}
							name={projects[i]?.title ?? "Cool Project"}
							techTags={projects[i]?.tags.split(' ') ?? []}
							liveUrl={projects[i]?.liveUrl ?? ""}
							githubUrl={projects[i]?.sourceUrl ?? ""}
							img_primary={projects[i]?.img_primary ?? ""}
							img_secondary={projects[i]?.img_secondary ?? ""}
							img_tertiary={projects[i]?.img_tertiary ?? ""}
							color={projects[i]?.color ?? "white"}
							className={`grow ${i === 0 ? "md:row-span-2" : ""} ${i === 2 ? "md:row-start-2 md:col-start-2" : ""}`}
							whiteTheme={i == 1}
							small={i !== 0} onMouseEnter={() => onTitleHighlight(projects[i]?.color ?? "white")} />
					))
				}
			</div>
		</div>
	);
}

type SectionWorkProps = {
	projects: ProjectRecord[];
};
