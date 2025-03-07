import { ArticleDisplay } from "@/components/ArticleDisplay";
import { ArticleMetadata } from "@/types";

export default function SectionArticles({articles}: SectionArticleProps) {
	return (
		<div id="articles" className="pt-16 pb-48">
			<h2 className="w-fit pb-4 text-4xl md:text-5xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">Articles</h2>

			<div className={`after:pointer-events-none relative after:absolute ${articles.length > 2 ? "after:inset-0" : ""} md:after:bg-linear-to-r after:from-black/0 after:from-90% after:to-black/100`}>
				<div className="flex max-md:flex-wrap gap-2 sm:gap-4 overflow-y-auto">
					{
						articles.length > 0 ?
							articles.map(article => <ArticleDisplay key={article.title} metadata={article} />) :
							<div className="text-zinc-500">No articles yet...</div>
					}
				</div>
			</div>
		</div>
	);
}

type SectionArticleProps = {
	articles: ArticleMetadata[];
};
