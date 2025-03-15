export function getBaseURL() {
	let baseURL = process.env.CMS_EXTERNAL_URL;
	if(typeof window == 'undefined') {
		baseURL = process.env.CMS_INTERNAL_URL;
	}

	return baseURL;
}

export async function get<T>({url, headers}: RequestProps): Promise<T | null> {
	return await networkRequest<T>({url, headers, method: "GET"});
}

export async function post<T>({url, headers, body}: BodiedRequestProps): Promise<T | null> {
	const finalHeaders = concatHeaders(new Headers([["Content-Type", "application/json"]]), headers ?? new Headers());
	return await networkRequest<T>({url, headers: finalHeaders, body, method: "POST"});
}

export async function put<T>({url, headers, body}: BodiedRequestProps): Promise<T | null> {
	const finalHeaders = concatHeaders(new Headers([["Content-Type", "application/json"]]), headers ?? new Headers());
	return await networkRequest<T>({url, headers: finalHeaders, body, method: "PUT"});
}

export async function del({url, headers}: RequestProps) {
	await networkRequest({url, headers, method: "DELETE"});
	return null;
}

async function networkRequest<T>({url, method, headers, body}: GeneralizedRequestProps) {
	let finalHeaders = concatHeaders(defaultHeaders, headers ?? new Headers());

	try {
		const serverRequest = await fetch(url, {headers: finalHeaders, method, body: JSON.stringify(body)});
		if(serverRequest == null || serverRequest?.ok == false) {
			return null;
		}

		const response = await serverRequest.json() as CMSResponse<T>;
		if(response.status != "ok") {
			return null;
		}

		return response.data ?? null;
	} catch(error) {
		console.error(`Error in network request for (${method}:${url}):`, error);
		return null;
	}
}

type CMSResponse<T> = {
	status?: "ok" | "error";
	message?: string;
	data?: T;
};

type GeneralizedRequestProps = {
	method: "GET" | "POST" | "PUT" | "DELETE";
} & RequestProps;

type RequestProps = {
	url: URL;
	headers?: Headers;
	body?: {[key: string]: any};
};

type BodiedRequestProps = Omit<RequestProps, "body"> & {
	body: {[key: string]: any};
}

const defaultHeaders = new Headers([
	["Accept", "application/json"],
]);

function concatHeaders(...headers: Headers[]): Headers {
	let headerList: HeadersInit = []
	for(const h of headers) {
		headerList.push(...h.entries());
	}
	return new Headers(headerList);
}
