export async function get<T>({url, headers}: RequestProps): Promise<T | null> {
	let finalHeaders = concatHeaders(defaultHeaders, headers ?? new Headers());

	try {
		const serverRequest = await fetch(url, {
			headers: finalHeaders,
			method: "GET",
		});

		if(serverRequest == null || serverRequest?.ok == false) {
			return null;
		}

		const response = await serverRequest.json() as CMSResponse<T>;
		if(response.status != "ok") {
			return null;
		}

		return response.data ?? null;
	} catch {
		return null;
	}
}

export async function post<T>({url, headers, body}: BodiedReqeuestProps): Promise<T | null> {
	let finalHeaders = concatHeaders(
		new Headers([["Content-Type", "application/json"]]),
		defaultHeaders,
		headers ?? new Headers());

	try {
		const serverRequest = await fetch(url, {
			headers: finalHeaders,
			method: "POST",
			body: JSON.stringify(body),
		});

		if(serverRequest == null || serverRequest?.ok == false) {
			return null;
		}

		const response = await serverRequest.json() as CMSResponse<T>;
		if(response.status != "ok") {
			return null;
		}

		return response.data ?? null;
	} catch {
		return null;
	}
}

export async function put<T>({url, headers, body}: BodiedReqeuestProps): Promise<T | null> {
	let finalHeaders = concatHeaders(
		defaultHeaders,
		new Headers([["Content-Type", "application/json"]]),
		headers ?? new Headers());

	try {
		const serverRequest = await fetch(url, {
			headers: finalHeaders,
			method: "PUT",
			body: JSON.stringify(body),
		});

		if(serverRequest == null || serverRequest?.ok == false) {
			return null;
		}

		const response = await serverRequest.json() as CMSResponse<T>;
		if(response.status != "ok") {
			return null;
		}

		return response.data ?? null;
	} catch {
		return null;
	}
}

type CMSResponse<T> = {
	status?: "ok" | "error";
	message?: string;
	data?: T;
};

type RequestProps = {
	url: URL;
	headers?: Headers;
};

type BodiedReqeuestProps = {
	body: {[key: string]: any},
} & RequestProps;

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
