type CMSResponse<T> = {
	status?: "ok" | "error";
	message?: string;
	data?: T;
};


export async function get<T>({url, headers}: GetRequestProps): Promise<T | null> {
	let finalHeaders: Headers;
	if(headers == null) {
		finalHeaders = defaultHeaders;
	} else {
		finalHeaders = new Headers([...defaultHeaders.entries(), ...headers.entries()]);
	}

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

type GetRequestProps = {
	url: URL;
	headers?: Headers;
};

const defaultHeaders = new Headers([
	["Accept", "application/json"]
]);
