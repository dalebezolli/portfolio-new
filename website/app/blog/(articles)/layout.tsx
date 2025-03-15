import "@/public/tokyo-night-dark.css";
import { CenterContainer } from "@/components/CenterContainer";

export default async function Article({children}: ArticleProps) {
	return (
		<CenterContainer className="pb-32">
				<main className="w-[70ch]">
					{children}
				</main>
		</CenterContainer>
	);
}

type ArticleProps = Readonly<{children: React.ReactNode}>
