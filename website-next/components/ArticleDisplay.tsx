import { ArticleMetadata } from "../types";

export function ArticleDisplay({metadata}: ArticleProps) {
	return (
		<a href={metadata.title ? metadata.url : ''} className="flex max-md:grow bg-zinc-900 rounded-xl overflow-clip">
			{
				metadata.img && <div className="w-[100px]">
					<img className="w-full h-full object-cover" src={metadata.img} />
				</div>
			}

			<div className="w-[300px] flex flex-col gap-4 p-4 text-zinc-500">
				<h3 className="text-xl font-semibold text-white">{metadata.title}</h3>
				<p>{metadata.description}</p>
			</div>
		</a>
	);
}

type ArticleProps = {
	metadata: ArticleMetadata;
};
