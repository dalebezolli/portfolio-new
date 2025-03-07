import { CenterContainer } from "@/components/CenterContainer";
import { ProjectRecord } from "@/types";
import { get, getBaseURL } from "@/utils/network";
import SectionWork from "./SectionWork";
import SectionArticles from "./SectionArticles";
import SectionAbout from "./SectionAbout";
import SectionContactMe from "./SectionContactMe";
import { getArticleData } from "@/utils";

export default async function Index() {
	const articles = await getArticleData();
	const projects = await get<ProjectRecord[]>({url: new URL(`${getBaseURL()}/projects`)});
	if(projects == null) return;

	return (
		<main>
			<CenterContainer>
				<SectionWork projects={projects} />
				<SectionArticles articles={articles} />
				<SectionAbout />
				<SectionContactMe />
			</CenterContainer>
		</main>
	);
}
