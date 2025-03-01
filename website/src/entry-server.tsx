import renderToString from 'preact-render-to-string';
import { getRoute } from './router';
import { App } from './App';

export async function render(_url: string) {
	import.meta.env.VITE_CMS_URL = import.meta.env.VITE_CMS_INTERNAL_URL;
	return { html: renderToString(<App>{await getRoute('/' + _url)}</App>) };
};
