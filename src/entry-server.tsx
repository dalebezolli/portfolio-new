import renderToString from 'preact-render-to-string';
import { getRoute } from './router';

export async function render(_url: string) {
	return { html: renderToString(await getRoute('/' + _url)) };
};
