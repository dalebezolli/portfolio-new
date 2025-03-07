export default function SectionAbout() {
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
