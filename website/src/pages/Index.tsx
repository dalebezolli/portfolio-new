import { useEffect, useState } from "preact/hooks";
import { ArticleCard } from "../components/ArticleCard";
import { CenterContainer } from "../components/CenteredContainer";
import Icon from "../components/Icon";
import ProjectDisplay from "../components/ProjectDisplay";
import { get } from "../utils/network";
import { createRef } from "preact";
import { ArticleRecord, ProjectRecord } from "../types";
import { imgUrlToThumbnailUrl } from "../utils/imageConversion";

export function Index() {
	return (
		<main>
			<CenterContainer>
				<SectionWork />
				<SectionArticles />
				<SectionAbout />
				<SectionContactMe />
			</CenterContainer>
		</main>
	);
}

function SectionWork() {
	const [projects, setProjects] = useState<ProjectRecord[]>([]);
	const refTitle = createRef<HTMLHeadingElement>();

	useEffect(() => {
		initializeProjects();
	}, []);

	async function initializeProjects() {
		let baseURL = import.meta.env.VITE_CMS_EXTERNAL_URL;
		if(typeof window == 'undefined') {
			baseURL = import.meta.env.VITE_CMS_INTERNAL_URL;
		}
		const data = await get<ProjectRecord[]>({url: new URL(`${baseURL}/projects`)});
		if(data == null) return;
		setProjects(data);
	}

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
							projectId={projects[i]?._id ?? ""}
							name={projects[i]?.title ?? "Cool Project"}
							techTags={projects[i]?.tags.split(' ') ?? []}
							liveUrl={projects[i]?.liveUrl ?? ""}
							githubUrl={projects[i]?.sourceUrl ?? ""}
							img_primary={imgUrlToThumbnailUrl(projects[i]?.img_primary ?? "")}
							img_secondary={imgUrlToThumbnailUrl(projects[i]?.img_secondary ?? "")}
							img_tertiary={imgUrlToThumbnailUrl(projects[i]?.img_tertiary ?? "")}
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

function SectionArticles() {
	const [articles, setArticles] = useState<ArticleRecord[]>([]);

	useEffect(() => {
		initializeArticles();
	}, []);

	async function initializeArticles() {
		let baseURL = import.meta.env.VITE_CMS_EXTERNAL_URL;
		if(typeof window == 'undefined') {
			baseURL = import.meta.env.VITE_CMS_INTERNAL_URL;
		}
		const data = await get<ArticleRecord[]>({url: new URL(`${baseURL}/articles`)});
		if(data == null) return;
		setArticles(data);
	}

	return (
		<div id="articles" className="pt-16 pb-48">
			<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">Articles</h2>

			<div className={`after:pointer-events-none relative after:absolute ${articles.length > 2 ? "after:inset-0" : ""} md:after:bg-linear-to-r after:from-black/0 after:from-90% after:to-black/100`}>
				<div className="flex max-md:flex-wrap gap-2 sm:gap-4 overflow-y-auto">
					{
						articles.length > 0 ?
							articles.map(article => <ArticleCard metadata={article} />) :
							<div className="text-zinc-500">No articles yet...</div>
					}
				</div>
			</div>
		</div>
	);
}

function SectionAbout() {
	return (
		<div id="about" className="pt-16 pb-48">
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
		<div id="connect" className="pt-16 pb-48">
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
