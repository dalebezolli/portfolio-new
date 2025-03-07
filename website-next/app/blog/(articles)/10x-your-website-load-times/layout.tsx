import "@/public/tokyo-night-dark.css";
import { CenterContainer } from "@/components/CenterContainer";

export default async function Article({children}: ArticleProps) {
	return (
		<CenterContainer>
				<div className="w-[60ch]">
					{children}
				</div>
		</CenterContainer>
	);
}

type ArticleProps = Readonly<{children: React.ReactNode}>
