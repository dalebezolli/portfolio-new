import { PropsWithChildren } from "react";

export default function ArticleHero({title, publishedAt, children}: ArticleHeroProps) {
	const publishedAtDate = new Date(publishedAt);
	const cleanPublishedAt = publishedAtDate.toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric"
	});

	const dateTimePublishedAt = publishedAtDate.toISOString().split("T")[0];

	return (
		<>
			<div className="h-16 md:h-24"></div>
			<h1 className="w-fit md:pb-2 text-2xl md:text-4xl font-heading font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-white/40 transition-colors">{title}</h1>
			{children}
			<p className="max-sm:text-sm text-zinc-400 italic">
				Last updated on{" "}
				<time dateTime={dateTimePublishedAt} className="max-lg text-zinc-200 not-italica font-bold">{cleanPublishedAt}</time>
			</p>
			<div className="h-12"></div>
		</>
	);
}

type ArticleHeroProps = PropsWithChildren<{
	title: string,
	publishedAt: string,
}>;
