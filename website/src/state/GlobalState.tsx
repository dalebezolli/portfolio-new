import { createContext } from "preact";
import { PropsWithChildren, useState } from "preact/compat";

type CollectionPath = string;
export type Collections = Record<CollectionPath, Collection>;

type GlobalStateDetails = {
	collections: Collections;
	selectedCollection: CollectionPath | null;


	initializeCollections: (collections: Collection[]) => void;
	setCollection: (collection: Collection) => void;
	removeCollection: (path: CollectionPath) => void;

	setRecord: (path: CollectionPath, record: CollectionRecord) => void;
	removeRecord: (path: CollectionPath, recordId: string) => void;

	setSelectedCollection: (collection: CollectionPath) => void;
};

const GlobalState = createContext<GlobalStateDetails>({
	collections: {},
	selectedCollection: null,

	initializeCollections: () => {},
	setCollection: () => {},
	removeCollection: () => {},

	setRecord: () => {},
	removeRecord: () => {},

	setSelectedCollection: () => {},
});

export default GlobalState;

export function GlobalStateProvider({children}: PropsWithChildren) {
	const [collections, setCollections] = useState<Collections>({});
	const [selectedCollection, setSelectedCollection] = useState<CollectionPath | null>(null);

	function initializeCollections(collections: Collection[]) {
		const collectionObject: Collections = {};

		for(const col of collections) {
			collectionObject[col.path] = col;
		}

		setCollections(collectionObject);
	}

	function setCollection(collection: Collection) {
		setCollections(old => ({...old, [collection.path]: collection}));
	}

	function removeCollection(path: CollectionPath) {
		setCollections(old => {
			const {[path]:_, ...rest} = old;
			return rest;
		});
	}

	function setRecord(path: CollectionPath, record: CollectionRecord) {
		setCollections(old => {
			const collection = old[path];
			if(collection == null) return old;

			const newRecords = {...collection.records, [record._id]: record};
			return {...old, [path]: {...collection, records: newRecords}};
		});
	}
	
	function removeRecord(path: CollectionPath, recordId: string) {
		setCollections(old => {
			const collection = old[path];
			if(collection == null) return old;

			const {[recordId]:_, ...rest} = collection.records;
			return {...old, [path]: {...collection, records: rest}};
		});
	}
	
	const contextValue: GlobalStateDetails = {
		collections,
		selectedCollection,

		initializeCollections,
		setCollection,
		removeCollection,

		setRecord,
		removeRecord,

		setSelectedCollection,
	};

	return (
		<GlobalState.Provider value={contextValue}>
			{children}
		</GlobalState.Provider>
	);
}
