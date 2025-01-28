import './../style.css';
import { hydrate } from 'preact';
import { getRoute } from './router';

async function prepareContent() {
	hydrate(await getRoute(window.location.pathname), document.getElementById('app') as HTMLElement);
}

prepareContent();
