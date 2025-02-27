import './../style.css';
import { hydrate } from 'preact';
import { App } from './App';
import { Router } from 'wouter-preact';

async function prepareContent() {
	hydrate(<Router><App /></Router>, document.getElementById('app') as HTMLElement);
}
prepareContent();
