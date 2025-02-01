import { ArticleCard } from "../components/ArticleCard";
import { CenterContainer } from "../components/CenteredContainer";
import Icon from "../components/Icon";
import ProjectDisplay from "../components/ProjectDisplay";

export function Index() {
	return (
		<CenterContainer>
			<SectionWork />
			<SectionArticles />
			<SectionAbout />
			<SectionContactMe />
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
