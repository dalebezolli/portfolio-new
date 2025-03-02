export function imgUrlToThumbnailUrl(url: string): string {
	let urlChunks = url.split(".");
	urlChunks[urlChunks.length - 2] += "-thumbnail"

	return urlChunks.join(".");
}
