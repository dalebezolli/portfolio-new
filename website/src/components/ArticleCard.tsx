type ArticleProps = {
	metadata: ArticleMetadata;
};
export function ArticleCard({metadata}: ArticleProps) {
	return (
		<a className="flex max-md:grow bg-zinc-900 rounded-xl">
			<div className="w-[100px]">
				Img
			</div>

			<div className="w-[300px] flex flex-col gap-4 p-4 text-zinc-500">
				<p>{metadata.releaseDate.toISOString()}</p>
				<h3 className="text-xl font-semibold text-white">{metadata.title}</h3>
				<p>{metadata.description}</p>
			</div>
		</a>
	);
}
