import Icon from "@/components/Icon";

export default function SectionContactMe() {
	return (
		<div id="connect" className="pt-16 pb-48">
			<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">
				Let's Connect
			</h2>
			
			<p className="text-zinc-500">I’m always on the lookout for new <span className="text-blue-200">exciting adventures</span> to follow.</p>
			<p className="text-zinc-500">If you’re following one and you want me to be a part of it, <span className="text-blue-200">contact me.</span></p>

			<section className="flex gap-4 pt-4">
				<a href="https://www.linkedin.com/in/dale-bezolli/" className="group" target="_blank">
					<Icon icon="linkedin" size={28} colorFill="fill-zinc-400 group-hover:fill-blue-200" />
				</a>

				<a href="https://x.com/bez_dale" className="group" target="_blank">
					<Icon icon="twitter" size={28} colorFill="fill-zinc-400 group-hover:fill-blue-200" />
				</a>

				<a href="mailto:pandelibezolli@gmail.com" className="group" target="_blank">
					<Icon icon="email" size={28} colorFill="fill-zinc-400 group-hover:fill-blue-200" />
				</a>
			</section>
		</div>
	);
}
