import { PropsWithChildren } from "preact/compat";
import { CenterContainer } from "./components/CenteredContainer";

export function App({children}: PropsWithChildren) {
	return (
		<div className="bg-black text-white min-w-screen min-h-screen" id="top">
			<Header />
			<main>{children}</main>
		</div>
	)
}

function Header() {
	return (
		<CenterContainer>
			<header className="flex justify-between pt-16 pb-8">
				<h1><a href="/#top" className="
					w-fit pb-4 text-2xl font-semibold text-transparent 
					bg-clip-text bg-linear-to-r from-white to-white/20 transition-colors hover:from-blue-200 hover:to-slate-600 hover:from-50%">Dale Bezolli</a></h1>

				<nav>
					<ul className="flex gap-2">
						<li><HeadingLink text="Work" /></li>
						<li><HeadingLink text="Aritcles" /></li>
						<li><HeadingLink text="About Me" /></li>
						<li><HeadingLink text="Let's Connect" /></li>
					</ul>
				</nav>
			</header>
		</CenterContainer>
	);
}

type HeadlingLinkProps = {
	text: string;
	href?: string;
};

function HeadingLink({href, text}: HeadlingLinkProps) {
	return (
		<a className="group/action px-2 last-of-type:pr-0 py-1.5 flex flex-col items-center font-semibold cursor-pointer text-gray-400 hover:text-blue-200" href={href} target="_blank">
			<div className="flex items-center gap-2 group-hover/action:translate-y-[-20%] transition-transform ease-out">
				{text}
			</div>

			<div className="w-0 group-hover/action:w-[75%] h-[2px] bg-blue-200 transition-all ease-out"></div>
		</a>
	);
}
