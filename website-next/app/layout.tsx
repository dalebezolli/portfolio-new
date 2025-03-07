import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";
import Header from "@/components/Header";
import dotImg from "@/public/dot.png";

export const metadata: Metadata = {
	title: "Dale Bezolli",
	description: "Dale Bezolli's Portfolio website",
};

export default function RootLayout({children}: RootLayoutProps) {
	return (
		<html lang="en" className="scroll-smooth">
			<Head>
				<link rel="preconnect" href="https://fonts.googleapis.com"/>
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='anonymous'/>
				<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Reem+Kufi:wght@400..700&display=swap" rel="stylesheet"/>
			</Head>

			<body className="antialiased font-primary bg-white">
				<div className="bg-black text-white max-w-full min-h-screen" id="top">

					<div className="fixed inset-0 opacity-5 pointer-events-none" style={{ background: `url(${dotImg.src})`}}></div>
					<div className="fixed inset-0 pointer-events-none bg-radial-[circle_at_0_0] from-zinc-950 to-50% to-transparent"></div>
					<div className="fixed inset-0 opacity-50 pointer-events-none bg-radial-[circle_at_100%_100%] from-fuchsia-950 to-50% to-transparent"></div>

					<Header />

					<div className="relative z-0">
						{children}
					</div>
				</div>
			</body>
		</html>
	);
}

type RootLayoutProps = Readonly<{children: React.ReactNode}>
