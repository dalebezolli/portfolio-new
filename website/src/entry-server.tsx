import renderToString from 'preact-render-to-string';
import { App } from './App';
import { Router } from 'wouter-preact';

export async function render(_url: string) {
	return { html: renderToString(
		<Router ssrPath={'/' + _url} ssrSearch=''>
			<App/>
		</Router>
	) };
};
