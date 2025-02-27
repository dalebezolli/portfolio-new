import { Fragment} from "preact/compat";
import { Index } from "./pages/Index";
import { Route, Switch } from "wouter-preact";
import { NotFound } from "./pages/NotFound";
import Project from "./pages/Project";

export function App() {
	return (
		<Fragment>
			<Switch>
				<Route path="/" component={Index} />
				<Route path="/work" component={Project} />
				<Route component={NotFound} />
			</Switch>
		</Fragment>
	);
}
