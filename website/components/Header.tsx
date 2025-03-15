"use client";

import React, { Fragment, HTMLAttributes, useState } from "react";
import Icon from "@/components/Icon";
import { CenterContainer } from "@/components/CenterContainer";

export default function Header() {
	const [mobileHidden, setMobileHidden] = useState(true);

	return (
		<Fragment>
			<div className="
				sticky top-0 z-50
				backdrop-blur-sm bg-black/60
				after:contents-[''] after:relative after:block after:bottom-0 after:inset-x-0 after:h-px
				after:bg-radial after:from-zinc-400/20 after:to-transparent">
				<CenterContainer>
					<header className="flex justify-between items-center">
						<h1><a href="/#top" className="group/logo flex gap-2 items-center w-fit text-lg font-semibold text-white pt-5 pb-4">
							<Logo />
							Dale Bezolli
						</a></h1>

						<nav className="flex items-center">
							<button className="md:hidden cursor-pointer" onClick={() => setMobileHidden(!mobileHidden)}>
								<div className="relative flex w-[24px] h-[24px] flex-col justify-around items-end group/hamburger">
									<div className="w-[80%] group-hover/hamburger:w-full h-[2px] rounded-full bg-gray-400 group-hover/hamburger:bg-white transition-all ease-in-out duration-300"></div>
									<div className="w-[40%] group-hover/hamburger:w-full h-[2px] rounded-full bg-gray-400 group-hover/hamburger:bg-white transition-all ease-in-out duration-300"></div>
									<div className="w-[90%] group-hover/hamburger:w-full h-[2px] rounded-full bg-gray-400 group-hover/hamburger:bg-white transition-all ease-in-out duration-300"></div>
								</div>
							</button>

							<ul id="navigation-links" className="max-md:aria-hidden:hidden max-md:absolute max-md:top-[64px] max-md:inset-x-0 max-md:backdrop-blur-2xl max-md:bg-black/75 md:flex" aria-hidden={mobileHidden}>
								<li><HeadingLink text="Work" href="#work" /></li>
								<li><HeadingLink text="Articles" href="/#articles" /></li>
								<li><HeadingLink text="About Me" href="/#about" /></li>
								<li className="md:hidden"><HeadingLink text="Let's Talk" href="/#about" /></li>
							</ul>
						</nav>

						<CTAButton href="/#connect" className="max-md:hidden">
							Let's Talk
						</CTAButton>
					</header>
				</CenterContainer>
			</div>
		</Fragment>
	);
}

function Logo() {
	return (
		<div className="relative w-[24px] h-[24px]">
			<div className="absolute top-[0%] left-[0%] w-[33.333%] h-[33.333%] bg-zinc-200 group-hover/logo:animate-logo-block-1"></div>
			<div className="absolute top-[33.333%] left-[0%] w-[33.333%] h-[33.333%] bg-zinc-200 group-hover/logo:animate-logo-block-2"></div>
			<div className="absolute top-[66.666%] left-[0%] w-[33.333%] h-[33.333%] bg-zinc-200 group-hover/logo:animate-logo-block-3"></div>

			<div className="absolute top-[0%] left-[33.333%] w-[33.333%] h-[33.333%] bg-zinc-200 group-hover/logo:animate-logo-block-4"></div>
			<div className="absolute top-[66.666%] left-[33.333%] w-[33.333%] h-[33.333%] bg-zinc-200 group-hover/logo:animate-logo-block-1"></div>

			<div className="absolute top-[33.333%] left-[66.666%] w-[33.333%] h-[33.333%] bg-zinc-200 group-hover/logo:animate-logo-block-2"></div>
		</div>
	);
}

type HeadlingLinkProps = {
	text: string;
	href?: string;
};

function HeadingLink({href, text}: HeadlingLinkProps) {
	return (
		<a className="
			relative
			pt-5 pb-4 px-5 group/action
			flex flex-col items-center font-medium

			text-zinc-300 hover:text-zinc-100
			hover:bg-radial-[at_50%_90%] from-zinc-400/20 to-75% to-transparent

			transition-all cursor-pointer" href={href}>
			<div className="flex items-center gap-2 group-hover/action:translate-y-[-20%] transition-transform ease-out">
				{text}
			</div>

			<div className="
				absolute left-0 top-0 w-px h-0 group-hover/action:h-full
				bg-linear-to-b from-zinc-400/20 to-transparent
				transition-all ease-out"></div>

			<div className="
				absolute right-0 top-0 w-px h-0 group-hover/action:h-full
				bg-linear-to-b from-zinc-400/20 to-transparent
				transition-all ease-out"></div>

			<div className="
				absolute -bottom-[1.5px] w-0 group-hover/action:w-full h-px
				bg-radial from-zinc-400/50 to-transparent
				transition-all ease-out"></div>
		</a>
	);
}

type CTAButtonProps = {
	href: string;
} & HTMLAttributes<HTMLAnchorElement>;

function CTAButton({children, href, className=""}: CTAButtonProps) {
	return (
		<a href={href} className={`
			group/cta
			relative p-px rounded-full

			after:absolute after:content-['']
			after:bottom-0 after:left-0 after:w-[300px] after:h-[150px]
			after:-translate-x-[50%] after:translate-y-[50%]
			after:bg-radial after:from-zinc-600 after:to-50% after:to-transparent
			hover:after:animate-cta-highlight

			text-zinc-200 font-semibold
			overflow-clip transition-all ${className}`}>
			<div className="
				relative z-10
				bg-zinc-950
				pl-6 pr-4 py-2
				flex gap-2 items-center
				rounded-full">
				{children}

				<div className="relative p-2 rounded-full bg-black overflow-clip">
					<div className="
						absolute top-0 left-0
						group-hover/cta:-translate-y-full group-hover/cta:translate-x-full
						group-hover/cta:transition-transform group-hover/cta:duration-500
						group-hover/cta:ease-[cubic-bezier(0.39,_-0.8,_0.51,_0.5)]">
						<Icon icon="location-arrow" colorFill="fill-zinc-200" />
					</div>
					<div className="
						absolute top-0 left-0
						not-[&:is(:where(.group\/cta):hover_*)]:translate-y-full
						not-[&:is(:where(.group\/cta):hover_*)]:-translate-x-full
						group-hover/cta:transition-transform group-hover/cta:duration-500
						group-hover/cta:ease-[cubic-bezier(0.49,_-1.14,_0.51,_0.5)]">
						<Icon icon="location-arrow" colorFill="fill-zinc-200" />
					</div>
				</div>
			</div>
		</a>
	);
}
