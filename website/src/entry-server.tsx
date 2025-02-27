import renderToString from 'preact-render-to-string';
import { App } from './App';
import { Router } from 'wouter-preact';

export async function render(_url: string) {
	import.meta.env.VITE_CMS_URL = import.meta.env.VITE_CMS_INTERNAL_URL;
	return { html: renderToString(
		<Router ssrPath={'/' + _url} ssrSearch=''>
			<App/>
		</Router>
	) };
};
