import { Index } from "./pages/Index";
import { Route, Switch } from "wouter-preact";
import { NotFound } from "./pages/NotFound";
import Project from "./pages/Project";
import Header from "./components/Header";
import img from "./dot.png";

export function App() {
	return (
		<div className="bg-black text-white max-w-full min-h-screen scroll-smooth" id="top">
			<div className="fixed inset-0 opacity-15 pointer-events-none" style={{ background: `url(${img})`}}></div>
			<Header />

			<div className="relative z-0">
				<Switch>
					<Route path="/" component={Index} />
					<Route path="/work/:id" component={Project} />
					<Route component={NotFound} />
				</Switch>
			</div>
		</div>
	);
}
