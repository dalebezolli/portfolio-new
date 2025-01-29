import renderToString from 'preact-render-to-string';
import { getRoute } from './router';
import { App } from './app';

export async function render(_url: string) {
	return { html: renderToString(<App>{await getRoute('/' + _url)}</App>) };
};
