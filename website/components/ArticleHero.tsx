import { PropsWithChildren } from "react";

export default function ArticleHero({title, publishedAt, children}: ArticleHeroProps) {
	return (
		<>
			<div className="h-24"></div>
			<h1 className="w-fit pb-2 text-2xl md:text-4xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">{title}</h1>
			{children}
			<p className="text-zinc-400 italic">{new Date(publishedAt).toLocaleDateString(undefined, {month: "long", day: "numeric", year: "numeric"})}</p>
			<div className="h-12"></div>
		</>
	);
}

type ArticleHeroProps = PropsWithChildren<{
	title: string,
	publishedAt: string,
}>;
