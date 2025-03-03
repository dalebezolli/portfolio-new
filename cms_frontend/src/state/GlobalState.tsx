import { Collection, CollectionPath, CollectionRecord, Collections } from "../types";
import { createContext } from "preact";
import { PropsWithChildren, useState } from "preact/compat";
import { StateUpdater, useContext, useEffect } from "preact/hooks";
import { get } from "../utils/network";
import Login from "../pages/Login";

type GlobalStateDetails = {
	collections: Collections;
	selectedCollection: CollectionPath | null;

	editingCollection: Collection;
	editingRecord: {[key: string]: any};

	selectedRecords: {[key: string]: true};

	authPassword: string;

	initializeCollections: (collections: Collection[]) => void;
	setCollection: (collection: Collection) => void;
	removeCollection: (path: CollectionPath) => void;

	setRecord: (path: CollectionPath, record: CollectionRecord) => void;
	removeRecord: (path: CollectionPath, recordId: string) => void;

	setSelectedCollection: (collection: CollectionPath | null) => void;

	toggleSelectedRecord: (recordId: string) => void;
	addSelectedRecord: (...recordId: string[]) => void;
	removeSelectedRecord: (...recordId: string[]) => void;
	clearSelectedRecords: () => void;

	setEditingCollection: (value: StateUpdater<Collection>) => void;
	setEditingRecord: (value: StateUpdater<{[key: string]: any}>) => void;

	setAuthPassword: (value: StateUpdater<string>) => void;

};

const GlobalState = createContext<GlobalStateDetails>({
	collections: {},
	selectedCollection: null,
	editingCollection: {name: "", path: "", attributes: [], records: {}},
	editingRecord: {},

	selectedRecords: {},
	authPassword: "",

	initializeCollections: () => {},
	setCollection: () => {},
	removeCollection: () => {},

	setRecord: () => {},
	removeRecord: () => {},

	setSelectedCollection: () => {},

	toggleSelectedRecord: () => {},
	addSelectedRecord: () => {},
	removeSelectedRecord: () => {},
	clearSelectedRecords: () => {},

	setEditingCollection: () => {},
	setEditingRecord: () => {},

	setAuthPassword: () => {},
});

export function useGlobalState() {
	return useContext(GlobalState);
}

export function GlobalStateProvider({children}: PropsWithChildren) {
	const [collections, setCollections] = useState<Collections>({});
	const [authPassword, setAuthPassword] = useState<string>("");
	const [selectedCollection, setSelectedCollection] = useState<CollectionPath | null>(null);
	const [editingCollection, setEditingCollection] = useState<Collection>({name: "", path: "", attributes: [], records: {}});
	const [editingRecord, setEditingRecord] = useState<{[key: string]: any}>({});
	const [selectedRecords, setSelectedRecords] = useState<{[key: string]: true}>({});

	useEffect(() => {
		initializeCollections();
	}, []);

	async function initializeCollections() {
		const responseCollections = await get<Collection[]>({url: new URL(`${import.meta.env.VITE_CMS_URL}/collections`)});
		const collections = responseCollections?.data;
		if(collections == null) return;

		const collectionObject: Collections = {};

		for(const col of collections) {
			if(col._id == null) continue;
			const responseCollectionRecords = await get<CollectionRecord[]>({url: new URL(`${import.meta.env.VITE_CMS_URL}/${col.path}`)});
			const collectionRecords = responseCollectionRecords?.data;
			if(collectionRecords == null) continue;

			col.records = collectionRecords.reduce((acc, cur) => ({...acc, [cur._id]: cur}), {});
			collectionObject[col._id] = col;
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


	function toggleSelectedRecord(recordId: string) {
		if(selectedRecords[recordId] == null) {
			addSelectedRecord(recordId);
		} else {
			removeSelectedRecord(recordId);
		}
	}

	function addSelectedRecord(...recordId: string[]) {
		const formattedRecords = recordId.reduce((acc, cur) => ({...acc, [cur]: true}),{});
		setSelectedRecords(old => ({...old, ...formattedRecords}));
	}

	function removeSelectedRecord(...recordId: string[]) {
		const copy = {...selectedRecords};
		for(const r of recordId) {
			delete copy[r];
		}

		setSelectedRecords(copy);
	}

	function clearSelectedRecords() {
		setSelectedRecords(_ => ({}));
	}
	
	const contextValue: GlobalStateDetails = {
		collections,
		selectedCollection,
		selectedRecords,
		editingCollection,
		editingRecord,
		authPassword,

		initializeCollections,
		setCollection,
		removeCollection,

		setRecord,
		removeRecord,

		setSelectedCollection,

		toggleSelectedRecord,
		addSelectedRecord,
		removeSelectedRecord,
		clearSelectedRecords,

		setEditingCollection,
		setEditingRecord,

		setAuthPassword,
	};

	return (
		<GlobalState.Provider value={contextValue}>
			{ authPassword == "" ? <Login /> : children}
		</GlobalState.Provider>
	);
}
