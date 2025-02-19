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
