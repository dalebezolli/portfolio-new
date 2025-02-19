import { Collection, CollectionPath, CollectionRecord, Collections } from "../types";
import { createContext } from "preact";
import { PropsWithChildren, useState } from "preact/compat";
import { StateUpdater, useContext } from "preact/hooks";

type GlobalStateDetails = {
	collections: Collections;
	selectedCollection: CollectionPath | null;
	editingCollection: Collection;

	editingRecord: {[key: string]: string};

	initializeCollections: (collections: Collection[]) => void;
	setCollection: (collection: Collection) => void;
	removeCollection: (path: CollectionPath) => void;

	setRecord: (path: CollectionPath, record: CollectionRecord) => void;
	removeRecord: (path: CollectionPath, recordId: string) => void;

	setSelectedCollection: (collection: CollectionPath) => void;

	setEditingCollection: (value: StateUpdater<Collection>) => void;
	setEditingRecord: (value: StateUpdater<{[key: string]: string}>) => void;
};

const GlobalState = createContext<GlobalStateDetails>({
	collections: {},
	selectedCollection: null,
	editingCollection: {name: "", path: "", attributes: [], records: {}},
	editingRecord: {},

	initializeCollections: () => {},
	setCollection: () => {},
	removeCollection: () => {},

	setRecord: () => {},
	removeRecord: () => {},

	setSelectedCollection: () => {},

	setEditingCollection: () => {},
	setEditingRecord: () => {},
});

export function useGlobalState() {
	return useContext(GlobalState);
}

export function GlobalStateProvider({children}: PropsWithChildren) {
	const [collections, setCollections] = useState<Collections>({});
	const [selectedCollection, setSelectedCollection] = useState<CollectionPath | null>(null);
	const [editingCollection, setEditingCollection] = useState<Collection>({name: "", path: "", attributes: [], records: {}});
	const [editingRecord, setEditingRecord] = useState<{[key: string]: string}>({});

	function initializeCollections(collections: Collection[]) {
		const collectionObject: Collections = {};

		for(const col of collections) {
			collectionObject[col.path] = col;
		}

		setCollections(collectionObject);
	}

	function setCollection(collection: Collection) {
		if(collection._id == null) return;
		setCollections(old => ({...old, [collection._id!]: collection}));
	}

	function removeCollection(id: CollectionPath) {
		setCollections(old => {
			const {[id]:_, ...rest} = old;
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
		editingRecord,

		initializeCollections,
		setCollection,
		removeCollection,

		setRecord,
		removeRecord,

		setSelectedCollection,
		setEditingCollection,
		setEditingRecord,
	};

	return (
		<GlobalState.Provider value={contextValue}>
			{children}
		</GlobalState.Provider>
	);
}
