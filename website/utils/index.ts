import { ArticleMetadata } from "@/types";
import { readdirSync } from "fs";

const BLOG_ROOT = "./app/blog/(articles)";
const ARTICLE_BASEPATH = "blog";

export async function getArticleData(): Promise<ArticleMetadata[]> {
	let listArticle: ArticleMetadata[] = [];
	let listArticleDirs = readdirSync(BLOG_ROOT).filter(file => isDir(file));

	for(const articleDir of listArticleDirs) {
		const {metadata} = (await import(`/app/blog/(articles)/${articleDir}/page.mdx`)) as {metadata: Omit<ArticleMetadata, 'url'>};
		listArticle.push({...metadata, url: `${ARTICLE_BASEPATH}/${articleDir}`});
	}

	console.log("Articles:", listArticle);

	return listArticle;
}

function isDir(file: string): boolean {
	return !file.includes(".");
}
