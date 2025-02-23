import './../style.css';
import { hydrate } from 'preact';
import { App } from './app';
import { getRoute } from './router';

async function prepareContent() {
	hydrate(<App>{await getRoute(window.location.pathname)}</App>, document.getElementById('app') as HTMLElement);
}

prepareContent();
