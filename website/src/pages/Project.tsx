import { RouteComponentProps } from "wouter-preact";
import { get } from "../utils/network";
import { ProjectRecord } from "../types";
import { compileSync, runSync } from "@mdx-js/mdx";
import * as runtime from "preact/jsx-runtime";
import { useMDXComponents } from "@mdx-js/preact";
import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";
import { CenterContainer } from "../components/CenteredContainer";

export default function Project({params}: RouteComponentProps) {
	let [record, setRecord] = useState<ProjectRecord | null>(null);

	useEffect(() => {
		prepareProjectData();
	}, []);

	async function prepareProjectData() {
		let baseURL = import.meta.env.VITE_CMS_EXTERNAL_URL;
		if(typeof window === 'undefined') {
			baseURL = import.meta.env.VITE_CMS_INTERNAL_URL;
		}

		let record = await get<ProjectRecord>({ url: new URL(`${baseURL}/projects/${params.id}`)})
		setRecord(record);
		return record;
	}

	let Html: (props: any) => JSX.Element;
	if(record) {
		Html = getResource(record.description);
	} else {
		Html = () => <div></div>;
	}

	return (
		<CenterContainer>
			<h2>Project: {params.id}</h2>
			<Html />
		</CenterContainer>
	);
}

function getResource(resource: string): (props: any) => JSX.Element {
	let baseUrl = import.meta.url
	const compiledData = compileSync(resource, {
		format: 'mdx',
		providerImportSource: '@mdx-js/preact',
		jsxImportSource: 'preact',
		outputFormat: 'function-body',
		baseUrl,
	});

	const data = runSync(compiledData, {
		...runtime,
		useMDXComponents,
		baseUrl,
	});

	return data.default;
}
