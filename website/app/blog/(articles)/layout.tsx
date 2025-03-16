import "@/public/tokyo-night-dark.css";
import { CenterContainer } from "@/components/CenterContainer";

export default async function Article({children}: ArticleProps) {
	return (
		<CenterContainer className="pb-32">
				<main>
					{children}
				</main>
		</CenterContainer>
	);
}

type ArticleProps = Readonly<{children: React.ReactNode}>
