import { Fragment, PropsWithChildren, useState } from "preact/compat";
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
	const [mobileHidden, setMobileHidden] = useState(true);

	return (
		<Fragment>
			<div className="h-[56px]"></div>

			<CenterContainer className="sticky top-0 z-50 backdrop-blur-2xl bg-black/75">
				<header className="flex justify-between pt-4 pb-4 mb-4">
					<h1><a href="/#top" className="
						w-fit pb-4 text-2xl font-semibold text-transparent 
						bg-clip-text bg-linear-to-r from-white to-white/20 transition-colors hover:from-blue-200 hover:to-slate-600 hover:from-50%">Dale Bezolli</a></h1>

					<nav className="flex items-center">
						<button className="md:hidden cursor-pointer" onClick={() => setMobileHidden(!mobileHidden)}>
							<div className="relative flex w-[24px] h-[24px] flex flex-col justify-around items-end group/hamburger">
								<div className="w-[80%] group-hover/hamburger:w-full h-[2px] rounded-full bg-gray-400 group-hover/hamburger:bg-white transition-all ease-in-out duration-300"></div>
								<div className="w-[40%] group-hover/hamburger:w-full h-[2px] rounded-full bg-gray-400 group-hover/hamburger:bg-white transition-all ease-in-out duration-300"></div>
								<div className="w-[90%] group-hover/hamburger:w-full h-[2px] rounded-full bg-gray-400 group-hover/hamburger:bg-white transition-all ease-in-out duration-300"></div>
							</div>
						</button>

						<ul className="max-md:aria-hidden:hidden max-md:absolute max-md:top-[64px] max-md:inset-x-0 max-md:backdrop-blur-2xl max-md:bg-black/75 md:flex gap-2" aria-hidden={mobileHidden}>
							<li><HeadingLink text="Work" /></li>
							<li><HeadingLink text="Aritcles" /></li>
							<li><HeadingLink text="About Me" /></li>
							<li><HeadingLink text="Let's Connect" /></li>
						</ul>
					</nav>
				</header>
			</CenterContainer>
		</Fragment>
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
