import { PropsWithChildren } from "preact/compat";
import { CenterContainer } from "../components/CenteredContainer";
import { ArticleRecord } from "../types";

export default function Article({children, article}: ArticleProps) {
	return (
		<CenterContainer>
			<h2>Article: {article.title}</h2>
			{children}
		</CenterContainer>
	);
}

type ArticleProps = PropsWithChildren<{
	article: ArticleRecord;
}>;
