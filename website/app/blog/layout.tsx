import { CenterContainer } from "@/components/CenterContainer";

export default async function Article({children}: ArticleProps) {
	return (
		<CenterContainer>
				<div>
					{children}
				</div>
		</CenterContainer>
	);
}

type ArticleProps = Readonly<{children: React.ReactNode}>
