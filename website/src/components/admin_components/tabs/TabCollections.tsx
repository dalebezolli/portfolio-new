import { ButtonHTMLAttributes, useContext } from "preact/compat";
import Icon, { IconName } from "../../Icon";
import Button from "../Button";
import Table from "../Table";
import TabContext, { Tabs, TabWrapper } from "../Tabs";
import GlobalState from "../../../state/GlobalState";

export default function TabCollections() {
	return (
		<TabWrapper>
			<div className="grow flex">
				<SideNav />

				<main className="w-full h-full">
					<Tabs className="w-full h-full">
						<CollectionView />
						<CollectionEditor />
						<RecordEditor />
					</Tabs>
				</main>
			</div>
		</TabWrapper>
	);
}

function SideNav() {
	const {select} = useContext(TabContext);
	const {collections, selectedCollection, setSelectedCollection} = useContext(GlobalState);

	function selectCollection(path: string) {
		setSelectedCollection(path);
		select(0);
	}

	return (
		<div className="bg-gray-900 border-r border-gray-800">
			<CollectionSearch />
			<section className="px-4 pt-4 flex flex-col gap-2">
				{
					Object.entries(collections).map(([path, collection]) => (
						<Button
							key={path}
							text={collection.name}
							onClick={() => selectCollection(path)}
							active={path == selectedCollection}
							className="w-full"/>
					))
				}
				<Button text="New Collection" icon="plus" onClick={() => select(1)} className="w-full border-2 border-gray-800 mt-4 justify-center" />
			</section>
		</div>
	);
}

function CollectionView() {
	const {select} = useContext(TabContext);
	const {collections, selectedCollection} = useContext(GlobalState);

	const collectionName = (collections[selectedCollection ?? ""]) ? collections[selectedCollection ?? ""].name : "";

	if(!collectionName) {
		return (
			<div className="w-full p-8 pt-16 flex justify-center gap-8">
				<p className="font-bold text-xl text-gray-400">Create your first collection</p>
			</div>
		);
	}

	const rawRecords = Object.values(collections[selectedCollection!].records);
	console.log(rawRecords);
	let tableRecords = rawRecords.map(record => ({
			id: record._id,
			title: record['title'],
			status: 'Draft',
			createdAt: new Date().toISOString(),
	}));

	return (
		<div className="w-full p-8 flex flex-col gap-8">
			<header className="pb-12 flex flex-col gap-4">
				<div className="grow flex gap-2 items-center">
					<p className="text-lg font-semibold text-gray-600">Collections &nbsp;&nbsp;/&nbsp;&nbsp;
						<span className="text-gray-300">{collectionName}</span>
					</p>
					<Button text="Edit" icon="pen" onClick={() => select(1)} className="ml-auto w-fit border-2 border-gray-800 justify-center" />
				</div>
			</header>

			<div className="grow flex flex-col">
				<section className="pb-4 flex gap-2">
					<Button text="New Record" icon="plus" onClick={() => select(2)} className="w-fit" color="highlight" />
					<Button text="Search" icon="magnifying-glass" className="w-fit border-2 border-gray-800 justify-center" />
				</section>

				<Table
					columns={[{title: "ID"},{title: "Title", options:{width: ""}},{title: "Status"},{title: "Created At"}]} 
					records={tableRecords}
					onClickRow={() => select(2)}
				/>
			</div>

			<footer className="p-4 flex justify-between items-center gap-4 rounded-xl bg-gray-900 text-gray-400">
				<p>Total records: {tableRecords.length}</p>

				<section className="flex gap-2">
					<Button text="Edit" icon="pen" color="warning" disabled />
					<Button text="Delete" icon="trash-can" color="error" disabled />
				</section>
			</footer>
		</div>
	);
}

function CollectionEditor() {
	const {select} = useContext(TabContext);
	const {collections, setCollection, setSelectedCollection} = useContext(GlobalState);

	function createCollection() {
		const collection = {
			name: "Collection"+Object.entries(collections).length,
			path: "collection"+Object.entries(collections).length,
			attributes: [],
			records: {},
		};
		setCollection(collection);
		setSelectedCollection(collection.path);
		select(0);
	}

	return (
		<div>
			<p>Collection Editor</p>
			<Button text="Create Empty collection" color="success" onClick={createCollection} />
		</div>
	);
}

function RecordEditor() {
	const {select} = useContext(TabContext);
	const {collections, selectedCollection, setRecord} = useContext(GlobalState);

	function createRecord() {
		if(selectedCollection == null) return;

		const record = {
			_id: (Object.entries(collections[selectedCollection].records).length).toString(),
			title: "Record"+Object.entries(collections[selectedCollection].records).length,
		};
		setRecord(selectedCollection, record);
		select(0);
	}

	return (
		<div>
			<p>Record Editor</p>
			<Button text="Create Empty Record" color="success" onClick={createRecord} />
		</div>
	);
}

function CollectionSearch() {
	return (
		<input className="
			group p-8 flex gap-2 items-center
			hover:bg-gray-800
			font-bold text-gray-400 hover:text-violet-400 focus:text-violet-400
			border-b border-gray-800 hover:border-violet-400
			cursor-pointer transition-colors"
			placeholder="Search Collections"
			/>
	);
}

type CollectionButtonProps = {
	text?: string;
	icon?: IconName;
} & ButtonHTMLAttributes;

function CollectionButton({text, icon, ...rest}: CollectionButtonProps) {
	return (
		<button className="
			w-full
			group px-4 py-2 flex gap-2 items-center
			hover:bg-gray-800 focus:bg-gray-800 rounded-xl
			font-bold text-gray-400 hover:text-gray-200 focus:text-gray-200
			cursor-pointer transition-colors" {...rest}>
			{icon && <Icon icon={icon} colorFill="fill-gray-400 group-hover:fill-gray-200 group-focus:fill-gray-200" />}
			{text}
		</button>
	);
}
