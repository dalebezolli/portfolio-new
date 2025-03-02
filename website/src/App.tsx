import Header from "./components/Header";
import img from "./dot.png";
import { PropsWithChildren } from "preact/compat";

export function App({children}: PropsWithChildren) {
	return (
		<div className="bg-black text-white max-w-full min-h-screen scroll-smooth" id="top">

			<div className="fixed inset-0 opacity-5 pointer-events-none" style={{ background: `url(${img})`}}></div>
			<div className="fixed inset-0 pointer-events-none bg-radial-[circle_at_0_0] from-zinc-950 to-50% to-transparent"></div>
			<div className="fixed inset-0 opacity-50 pointer-events-none bg-radial-[circle_at_100%_100%] from-fuchsia-950 to-50% to-transparent"></div>

			<Header />

			<div className="relative z-0">
				{children}
			</div>
		</div>
	);
}
