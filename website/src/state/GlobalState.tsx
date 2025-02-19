import { createContext } from "preact";
import { PropsWithChildren, useState } from "preact/compat";
import { StateUpdater } from "preact/hooks";

type CollectionPath = string;
export type Collections = Record<CollectionPath, Collection>;

type GlobalStateDetails = {
	collections: Collections;
	selectedCollection: CollectionPath | null;
	editingCollection: Collection;
	editingCollectionStatus: "new" | "old";

	editingRecord: {[key: string]: string};


	initializeCollections: (collections: Collection[]) => void;
	setCollection: (collection: Collection) => void;
	removeCollection: (path: CollectionPath) => void;

	setRecord: (path: CollectionPath, record: CollectionRecord) => void;
	removeRecord: (path: CollectionPath, recordId: string) => void;

	setSelectedCollection: (collection: CollectionPath) => void;

	setEditingCollection: (value: StateUpdater<Collection>) => void;
	setEditingCollectionStatus: (value: StateUpdater<"new" | "old">) => void;
	setEditingRecord: (value: StateUpdater<object>) => void;
};

const GlobalState = createContext<GlobalStateDetails>({
	collections: {},
	selectedCollection: null,
	editingCollection: {name: "", path: "", attributes: [], records: {}},
	editingCollectionStatus: "new",
	editingRecord: {},

	initializeCollections: () => {},
	setCollection: () => {},
	removeCollection: () => {},

	setRecord: () => {},
	removeRecord: () => {},

	setSelectedCollection: () => {},

	setEditingCollection: () => {},
	setEditingCollectionStatus: () => {},
	setEditingRecord: () => {},
});

export default GlobalState;

export function GlobalStateProvider({children}: PropsWithChildren) {
	const [collections, setCollections] = useState<Collections>({});
	const [selectedCollection, setSelectedCollection] = useState<CollectionPath | null>(null);
	const [editingCollection, setEditingCollection] = useState<Collection>({name: "", path: "", attributes: [], records: {}});
	const [editingCollectionStatus, setEditingCollectionStatus] = useState<"new" | "old">("new");
	const [editingRecord, setEditingRecord] = useState<{[key: string]: string}>({});

	function initializeCollections(collections: Collection[]) {
		const collectionObject: Collections = {};

		for(const col of collections) {
			collectionObject[col.path] = col;
		}

		setCollections(collectionObject);
	}

	function setCollection(collection: Collection) {
		console.log("Updating collection:", collection.path, "with data", collection, collections);
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
		editingCollection,
		editingCollectionStatus,
		editingRecord,

		initializeCollections,
		setCollection,
		removeCollection,

		setRecord,
		removeRecord,

		setSelectedCollection,
		setEditingCollection,
		setEditingCollectionStatus,
		setEditingRecord,
	};

	return (
		<GlobalState.Provider value={contextValue}>
			{children}
		</GlobalState.Provider>
	);
}
