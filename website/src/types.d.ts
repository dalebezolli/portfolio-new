type ArticleMetadata = {
	title: string;
	description: string;
	releaseDate: Date;
};

type Collection = {
	name: string;
	path: string;
	attributes: CollectionAttribute[];
	records: Record<string, CollectionRecord>;
};

type CollectionAttribute = {
	name: string;
	type: CollectionAttributeType;
};

type CollectionRecord = {
	_id: string;
	[key: string]: string;
};

type CollectionAttributeType = "string" | "date" | "image" | "mdx";
