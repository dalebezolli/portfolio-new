import { useEffect, useState } from "preact/hooks";
import { ArticleCard } from "../components/ArticleCard";
import { CenterContainer } from "../components/CenteredContainer";
import Header from "../components/Header";
import Icon from "../components/Icon";
import ProjectDisplay from "../components/ProjectDisplay";
import { get } from "../utils/network";
import { createRef } from "preact";
import img from "../dot.png";

export function Index() {
	return (
		<div className="bg-black text-white max-w-full min-h-screen" id="top">
			<div className="fixed inset-0 opacity-15 pointer-events-none" style={{ background: `url(${img})`}}></div>
			<Header />
			<main>
				<CenterContainer>
					<SectionWork />
					<SectionArticles />
					<SectionAbout />
					<SectionContactMe />
				</CenterContainer>
			</main>
		</div>
	);
}

type ProjectRecord = {
	title: string,
	tags: string,
	description: string,
	liveUrl: string,
	sourceUrl: string,
	img_primary: string,
	img_secondary: string,
	img_tertiary: string,
	color: string,
};

function SectionWork() {
	const [projects, setProjects] = useState<ProjectRecord[]>([]);
	const refTitle = createRef<HTMLHeadingElement>();

	useEffect(() => {
		initializeProjects();
	}, []);

	async function initializeProjects() {
		const data = await get<ProjectRecord[]>({url: new URL(`${import.meta.env.VITE_CMS_URL}/projects`)});
		if(data == null) return;
		setProjects(data);
	}

	function onTitleHighlight(color: string) {
		if(refTitle.current == null) return;

		refTitle.current.style.setProperty('--tw-gradient-from', `var(--color-${color})`);
		refTitle.current.style.setProperty('--tw-gradient-to', `var(--color-${color}/40)`);

		for(let i = 0; i < refTitle.current.children.length; i++) {
			let spanChild = refTitle.current.children[i] as HTMLSpanElement;
			spanChild.style.animation = `word-bounce 300ms linear 1 ${i * 50}ms`;
			spanChild.onanimationend = () => spanChild.style.animation = '';
		}
	}

	return (
		<div className="pt-16 pb-48">
			<h2 ref={refTitle} className={`
				flex items-end
				w-fit pb-4
				text-4xl md:text-5xl font-heading font-semibold overflow-visible
				text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors`}>
				<span className="h-14 flex items-end">W</span>
				<span className="h-14 flex items-end">o</span>
				<span className="h-14 flex items-end">r</span>
				<span className="h-14 flex items-end">k</span>
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr] grid-rows-3 md:grid-rows-2 gap-4 perspective-distant">
				{
					[0,1,2].map((i) => (
						<ProjectDisplay
							name={projects[i]?.title ?? "Cool Project"}
							techTags={projects[i]?.tags.split(' ') ?? []}
							liveUrl={projects[i]?.liveUrl ?? ""}
							githubUrl={projects[i]?.sourceUrl ?? ""}
							img_primary={projects[i]?.img_primary ?? ""}
							img_secondary={projects[i]?.img_secondary ?? ""}
							img_tertiary={projects[i]?.img_tertiary ?? ""}
							color={projects[i]?.color ?? "white"}
							className={`grow ${i === 0 ? "md:row-span-2" : ""} ${i === 2 ? "md:row-start-2 md:col-start-2" : ""}`}
							small={i !== 0} onMouseEnter={() => onTitleHighlight(projects[i]?.color ?? "white")} />
					))
				}
			</div>
		</div>
	);
}

function SectionArticles() {
	return (
		<div className="pt-16 pb-48">
			<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">Articles</h2>

			<div className="after:pointer-events-none relative after:contents after:absolute after:inset-0 md:after:bg-linear-to-r after:from-black/0 after:from-90% after:to-black/100">
				<div className="flex max-md:flex-wrap gap-2 sm:gap-4 overflow-y-auto">
					<ArticleCard metadata={{title: "Hello World Title that is kinda long to fit in one line", description: "Silly Description", releaseDate: new Date()}} />
					<ArticleCard metadata={{title: "Hello World", description: "Supendously long description that will be so annoying to write but so satisfying to reat because I love reading supendously long article descriptions that make me wonder if I'll ever repeat this again", releaseDate: new Date()}} />
					<ArticleCard metadata={{title: "Hello World", description: "Silly Description", releaseDate: new Date()}} />
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
					I started working with computers early in my life, programming games and learning all about these complex machines. Now, I get to study about them at IHU as a <span className="text-blue-200">Computer Engineer</span>, but I haven’t stopped there...
				</p>

				<p className="text-zinc-500 max-w-[60ch]">
					<span className="text-blue-200">Engineering is my love.</span> I enjoy solving problems and packing them in elegant and functional programs that have the <span className="text-blue-200">user in the forefront.</span>
				</p>
			</div>

			<div className="hidden flex-col lg:items-end max-lg:mt-8">
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

function SectionContactMe() {
	return (
		<div className="pt-16 pb-48">
			<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">Let's Connect</h2>
			
			<p className="text-zinc-500">I’m always on the lookout for new <span className="text-blue-200">exciting adventures</span> to follow.</p>
			<p className="text-zinc-500">If you’re following one and you want me to be a part of it, <span className="text-blue-200">contact me.</span></p>

			<section className="flex gap-4 pt-4">
				<a href="https://www.linkedin.com/in/dale-bezolli/" className="group" target="_blank"><Icon icon="linkedin" size={28} colorFill="fill-zinc-400 group-hover:fill-blue-200" /></a>
				<a href="https://x.com/bez_dale" className="group" target="_blank"><Icon icon="twitter" size={28} colorFill="fill-zinc-400 group-hover:fill-blue-200" /></a>
				<a href="mailto:pandelibezolli@gmail.com" className="group" target="_blank"><Icon icon="email" size={28} colorFill="fill-zinc-400 group-hover:fill-blue-200" /></a>
			</section>
		</div>
	);
}
