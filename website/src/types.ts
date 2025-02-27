export type ArticleMetadata = {
	title: string;
	description: string;
	releaseDate: Date;
};

export type Collection = {
	_id?: string;
	name: string;
	path: string;
	attributes: CollectionAttribute[];
	records: Record<string, CollectionRecord>;
};

export type CollectionAttribute = {
	name?: string;
	type?: CollectionAttributeType;
};

export type CollectionRecord = {
	_id: string;
	[key: string]: string;
};

export type CollectionAttributeType = "string" | "date" | "image" | "mdx";

export type CollectionPath = string;
export type Collections = Record<CollectionPath, Collection>;

export type ProjectRecord = {
	_id: string,
	title: string,
	tags: string,
	description: string,
	liveUrl: string,
	sourceUrl: string,
	img_primary: string,
	img_secondary: string,
	img_tertiary: string,
	color: string,
};
