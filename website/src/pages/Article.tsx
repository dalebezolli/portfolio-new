import { PropsWithChildren } from "preact/compat";
import { CenterContainer } from "../components/CenteredContainer";
import { ArticleRecord } from "../types";

export default function Article({children, article}: ArticleProps) {
	return (
		<CenterContainer>
				<div className="w-[60ch]">
					<h2 className="pb-16 text-3xl font-semibold capitalize">{article.title}</h2>
					{children}
				</div>
		</CenterContainer>
	);
}

type ArticleProps = PropsWithChildren<{
	article: ArticleRecord;
}>;
