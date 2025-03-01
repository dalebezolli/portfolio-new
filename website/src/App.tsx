import Header from "./components/Header";
import img from "./dot.png";
import { PropsWithChildren } from "preact/compat";

export function App({children}: PropsWithChildren) {
	return (
		<div className="bg-black text-white max-w-full min-h-screen scroll-smooth" id="top">
			<div className="fixed inset-0 opacity-15 pointer-events-none" style={{ background: `url(${img})`}}></div>
			<Header />

			<div className="relative z-0">
				{children}
			</div>
		</div>
	);
}
