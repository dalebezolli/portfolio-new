import './../style.css';
import { hydrate } from 'preact';
import { getRoute } from './router';
import { App } from './App';

async function prepareContent() {
	hydrate(<App>{await getRoute(window.location.pathname)}</App>, document.getElementById('app') as HTMLElement);
}
prepareContent();
